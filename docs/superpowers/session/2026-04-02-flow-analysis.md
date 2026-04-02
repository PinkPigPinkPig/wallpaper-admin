# Flow Analysis: Create/Update Wallpaper & Category

**Date:** 2026-04-02
**Analyzed by:** Claude Opus 4.6

---

## CREATE WALLPAPER

```
User fills form + selects files
        │
        ▼
onSubmit(values)
        │
        ├──► if resourceFile.originFileObj
        │         UploadServices.uploadFile({ file, categoryId, type="content", name })
        │         ✅ OK
        │
        ├──► if thumbFile.originFileObj
        │         UploadServices.uploadFile({ file, categoryId, type="thumb", name })
        │         ✅ OK
        │
        └──► mutate(payload)  ──────► useMutation → BE
                  │
                  ├──► onSuccess: router.push("/admin/wallpaper")  ✅
                  └──► onError:   messageApi.error()              ✅

Issues: None
```

---

## CREATE CATEGORY

```
User fills form + selects thumbnail
        │
        ▼
onSubmit(values)
        │
        ├──► Step 1: CategoryServices.addCategory({ name, thumbUrl: "" })
        │         Returns { id, name, thumbUrl }
        │         ⚠ DB SEQUENCE BUG: PostgreSQL auto-increment out of sync
        │           → 500 Unique constraint failed on (id)
        │
        ├──► Step 2: if thumbFile → UploadServices.uploadFile({ file, categoryId, type="thumb", name })
        │         ⚠ MISSING originFileObj guard
        │           On create page, thumbFile always has originFileObj ✅
        │           But if thumbFile came from pre-populated initialValues (not possible here)
        │           this would silently skip the upload
        │
        ├──► Step 3: if thumbUrl
        │         CategoryServices.updateCategory(id, { thumbUrl })
        │         BE deletes old file on thumbUrl change ✅
        │
        └──► queryClient.invalidateQueries() + router.push("/admin/category")
              ⚠ router.push() is called directly, NOT in mutation callback
              → navigation fires even if Step 3 update fails!
```

**Root cause of 500 on create:** PostgreSQL sequence for `wallpaper_category.id` is out of sync.
Fix: `SELECT setval(pg_get_serial_sequence('"WallpaperCategory"', 'id'), (SELECT COALESCE(MAX(id), 0) FROM "WallpaperCategory"));`

---

## UPDATE WALLPAPER (WallpaperDetailClient)

```
Load wallpaper via useGetWallpaperDetail(wallpaperId)
        │
        ▼
initialValues (computed on every render)
        │
        ├──► resourceFiles: pre-populated fake file objects from wallpaper.resourceUrl
        │         uid: "resource-1", url: wallpaper.resourceUrl, thumbUrl: wallpaper.thumbUrl
        │         ⚠ No originFileObj on these fake objects!
        │
        └──► thumbFiles: pre-populated fake file objects from wallpaper.thumbUrl
                  uid: "thumb-1", url: wallpaper.thumbUrl, thumbUrl: wallpaper.thumbUrl
                  ⚠ No originFileObj on these fake objects!

User clicks Edit → isEditing=true
        │
        ▼
onSubmit(values)
        │
        ├──► resourceUrl = wallpaper.resourceUrl  (preserve old URL)       ✅
        ├──► thumbUrl     = wallpaper.thumbUrl      (preserve old URL)    ✅
        │
        ├──► if resourceFile && originFileObj
        │         ❌ BUG: fileToUpload = (file as File) || (file as {originFileObj?: File}).originFileObj
        │                     = RcFile       || undefined  = RcFile  (always truthy!)
        │         UploadServices.uploadFile({ file: RcFile, ... })
        │         → payload.file = RcFile (not a real File!)
        │         → BE receives malformed/empty file → upload fails
        │
        ├──► if thumbFile && originFileObj
        │         ❌ Same bug: fileToUpload = thumbFile (RcFile)
        │
        └──► await WallpaperServices.updateWallpaper(id, payload)
                  BE deletes old files on URL change ✅

        ├──► onSuccess() defined but NEVER passed to useMutation
        │         → Dead code — but router.push() IS called manually after await ✅
        │
        └──► ⚠ wallpaper-list cache NOT invalidated
                  → Table shows stale data after save

Issues:
  1. fileToUpload logic: `file || originFileObj` always resolves to RcFile (wrong!)
  2. initialValues: missing wallpaper dependency in useEffect (form not pre-populated)
  3. Cache not invalidated after save
```

**Correct guard should be:**
```ts
const isNewFile = (file as { originFileObj?: unknown }).originFileObj;
if (isNewFile) {
  const realFile = ((file as unknown) as { originFileObj: File }).originFileObj;
  thumbUrl = await uploadFile(realFile, ...);
}
```

---

## UPDATE CATEGORY (CategoryDetailClient)

```
Load category via useGetCategoryDetail(categoryId)
        │
        ▼
initialValues (computed on every render)
        │
        └──► thumbFiles: pre-populated fake file objects from category.thumbUrl
                  uid: "thumb-1", url: category.thumbUrl, thumbUrl: category.thumbUrl
                  ⚠ No originFileObj on these fake objects!

User clicks Edit → isEditing=true
        │
        ▼
onSubmit(values)
        │
        ├──► if thumbFile && originFileObj
        │         ❌ thumbFile type: TFileType = RcFile | File
        │         UploadServices.uploadFile({ file: thumbFile, ... })
        │         → payload.file = TFileType (may not be a real File!)
        │         → BE receives malformed/empty file
        │
        ├──► else thumbUrl = category?.thumbUrl
        │         ✅ Preserves old URL when no new file — correct
        │
        └──► await CategoryServices.updateCategory(id, payload)
                  ⚠ BE does NOT delete old thumb on update
                  → New file uploaded, old file stays on disk (orphaned)

Issues:
  1. thumbFile passed directly — TFileType may not be a real File
  2. BE doesn't delete old thumb on category update
  3. Cache not invalidated
  4. onSuccess/onError defined but never used
```

**⚠ Critical BE Bug:** `FileUploadModule` was NOT imported in `WallpaperCategoryModule` during our session,
which caused `WallpaperCategoryService` to not be able to inject `FileUploadService`.
Even after fixing the circular dependency with `forwardRef`, the old thumb orphan issue persists.

---

## Bug Summary

| # | Flow | Severity | Bug | Fix |
|---|------|----------|-----|-----|
| 1 | Update Wallpaper | HIGH | `fileToUpload = file \|\| originFileObj` always = RcFile (wrong!) | Use `if ((file as {originFileObj?: unknown}).originFileObj)` guard |
| 2 | Update Wallpaper | HIGH | Form not pre-populated (initialValues missing wallpaper dep) | Add `wallpaper` to useEffect dep array |
| 3 | Update Category | HIGH | `thumbFile` passed directly to upload — TFileType may not be File | Cast via `unknown` then extract originFileObj |
| 4 | Update Category | MEDIUM | BE doesn't delete old thumb on update | BE fix needed in wallpaper.category.service.ts |
| 5 | Update Wallpaper | LOW | wallpaper-list cache not invalidated | Add `queryClient.invalidateQueries({ queryKey: ["wallpaper-list"] })` |
| 6 | Create Category | MEDIUM | `router.push()` outside mutation callback | Move navigation inside try/catch or use try-finally guard |
| 7 | Both Updates | LOW | onSuccess/onError defined but not passed to useMutation | Clean up dead code |
| 8 | Create Category | CRITICAL | DB sequence out of sync | Reset: `SELECT setval(...) FROM "WallpaperCategory"` |
