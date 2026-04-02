# FE Update CRUD + E2E Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 2 BE orphaned file bugs, implement FE update CRUD for wallpaper/category/menu, write E2E Playwright suite against real backend.

**Architecture:** Create page reused for update (same form, different mode). File uploads happen first, then update payload sent. E2E tests use Playwright with real API calls and sequential execution.

**Tech Stack:** Next.js 15, NestJS 10, Prisma, Playwright, Ant Design 5, TanStack React Query 5

---

## Task 0: Verify Prerequisites

- [ ] **Step 1: Verify API.put exists**
Run: `grep -n "static put" src/lib/service/index.ts`
Expected: `static put = async` found (confirmed at line 164)

- [ ] **Step 2: Verify Playwright config**
Run: `cat playwright.config.ts`
Expected: testDir: './e2e', baseURL: 'http://localhost:3005'

- [ ] **Step 3: Commit**


---

## Task 1: BE Fix - Category Update: Delete Old Thumb on thumbUrl Change

**Backend file:** `/Users/tuanvq/Documents/Projects/Personal/file-management/src/wallpaper.category/wallpaper.category.service.ts`

**Context:**
- FileUploadService has method `deleteFileByPath(localPath: string)`
- WallpaperService already has a `urlToLocalPath()` helper (replicate it here)
- `update()` method needs to delete old thumb when `thumbUrl` changes
- WallpaperCategoryModule must import FileUploadModule

- [ ] **Step 1: Read WallpaperCategoryModule to check FileUploadModule import**
Read: `/Users/tuanvq/Documents/Projects/Personal/file-management/src/wallpaper.category/wallpaper.category.module.ts`
Check if `FileUploadModule` is in imports array. If missing, add it:
```typescript
import { FileUploadModule } from '@/file-upload/file-upload.module';
```
And add `FileUploadModule` to the `@Module({ imports: [...] })` array.

- [ ] **Step 2: Read current WallpaperCategoryService**
Read: `/Users/tuanvq/Documents/Projects/Personal/file-management/src/wallpaper.category/wallpaper.category.service.ts`

- [ ] **Step 3: Add imports**
Add to top of file if not present:
```typescript
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { FileUploadService } from '@/file-upload/file-upload.service';
```

- [ ] **Step 4: Update constructor to inject FileUploadService and ConfigService**
Read current constructor. Replace with:
```typescript
constructor(
  private readonly wallpaperCategoryRepository: WallpaperCategoryRepository,
  private readonly fileUploadService: FileUploadService,
  private readonly configService: ConfigService<AllConfigType>,
) {}
```

- [ ] **Step 5: Add urlToLocalPath private method after constructor**
```typescript
private urlToLocalPath(url: string): string | null {
  if (!url) return null;
  const baseUrl = this.configService.get<string>('app.appBaseUrl', { infer: true });
  if (!url.startsWith(baseUrl)) return null;
  const relativePath = url.replace(baseUrl + '/', '');
  if (!relativePath || relativePath === '.' || relativePath.includes('..')) return null;
  const containerBase = this.configService.get<string>('app.containerFolderPath', { infer: true });
  return path.join(containerBase, decodeURIComponent(relativePath));
}
```

- [ ] **Step 6: Modify update() to delete old thumb**
Read the current `update()` method. Replace with:
```typescript
async update(id: number, data: UpdateCategoryRequestDto) {
  const category = await this.wallpaperCategoryRepository.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  // Delete old thumb if thumbUrl is being changed
  if (data.thumbUrl !== undefined && category.thumbUrl !== data.thumbUrl) {
    const oldLocalPath = this.urlToLocalPath(category.thumbUrl);
    if (oldLocalPath) {
      this.fileUploadService.deleteFileByPath(oldLocalPath);
    }
  }

  const params: Prisma.WallpaperCategoryUpdateInput = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.thumbUrl !== undefined && { thumbUrl: data.thumbUrl }),
  };

  const updatedCategory = await this.wallpaperCategoryRepository.update(id, params);

  if (!updatedCategory) {
    throw new Error('Failed to update category');
  }

  return {
    ...updatedCategory,
    updated: updatedCategory.updated.toString(),
  };
}
```

- [ ] **Step 7: Run lint to verify no TypeScript errors**
Run: `cd /Users/tuanvq/Documents/Projects/Personal/file-management && npm run lint`
Expected: No errors

- [ ] **Step 8: Commit**


---

## Task 2: BE Fix - Category Delete: Delete Thumb on Category Delete

**Backend file:** `/Users/tuanvq/Documents/Projects/Personal/file-management/src/wallpaper.category/wallpaper.category.service.ts`

**Context:**
- Same file as Task 1. Add thumb deletion to the `delete()` method.

- [ ] **Step 1: Read current delete() method**
Read: `/Users/tuanvq/Documents/Projects/Personal/file-management/src/wallpaper.category/wallpaper.category.service.ts`

- [ ] **Step 2: Replace delete() method**
Replace the current `delete()` method with:
```typescript
async delete(id: number) {
  const category = await this.wallpaperCategoryRepository.findById(id);
  if (category && category.thumbUrl) {
    const localPath = this.urlToLocalPath(category.thumbUrl);
    if (localPath) {
      this.fileUploadService.deleteFileByPath(localPath);
    }
  }
  return await this.wallpaperCategoryRepository.delete(id);
}
```

- [ ] **Step 3: Run lint**
Run: `cd /Users/tuanvq/Documents/Projects/Personal/file-management && npm run lint`
Expected: No errors

- [ ] **Step 4: Commit**

---

## Task 3: FE - Wallpaper Update Service Method

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/features/wallpaper/services/index.tsx`

- [ ] **Step 1: Read current service file**
Read: `src/features/wallpaper/services/index.tsx`

- [ ] **Step 2: Add updateWallpaper static method**
After the `addWallpaper` method, add:
```ts
static updateWallpaper(id: number, payload: TSaveWallpaperPayload) {
  return API.put<TWallpaper>(`${WallpaperServices.basePath}/${id}`, payload);
}
```

- [ ] **Step 3: Verify type compatibility**
The `TSaveWallpaperPayload` type in `src/features/wallpaper/data/type.ts` maps directly to `UpdateWallpaperRequestDto` on BE (all fields optional). No type changes needed.

- [ ] **Step 4: Commit**

---

## Task 4: FE - Wallpaper Form: Handle Pre-existing Files on Update

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/features/wallpaper/components/form/WallpaperForm.tsx`

**Context:**
- On update (initialValues provided), existing resourceUrl/thumbUrl must be preserved if no new file is uploaded
- On create, files are always required (new uploads)
- The key is: if resourceFiles/thumbFiles are empty arrays at submit time, don't send undefined — send the existing URL from initialValues

- [ ] **Step 1: Read current WallpaperForm**
Read: `src/features/wallpaper/components/form/WallpaperForm.tsx`

- [ ] **Step 2: Modify TForm type to include optional resourceUrl and thumbUrl**
Read the current `TForm` type. Change it to:
```ts
export type TForm = {
  categoryId: number;
  name: string;
  resolution?: string;
  size?: string;
  mime?: TMimeType;
  tags?: string;
  resourceFiles?: TFileType[];
  thumbFiles?: TFileType[];
  resourceUrl?: string;   // existing URL (from initialValues on update)
  thumbUrl?: string;       // existing URL (from initialValues on update)
};
```

- [ ] **Step 3: Modify onFinish to preserve existing URLs when no new file uploaded**
Read the current `onFinish` function. The logic should be:
```ts
const onFinish: FormProps<TForm>["onFinish"] = async (values) => {
  if (!onSubmit) return;

  const resourceFile = resourceFiles[0];
  const thumbFile = thumbFiles[0];

  let finalResourceUrl = values.resourceUrl ?? '';
  let finalThumbUrl = values.thumbUrl ?? '';

  if (resourceFile) {
    // Get file size
    const fileSizeInBytes = resourceFile.size || 0;
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    const size = fileSizeInBytes > 1024 * 1024 ? `${fileSizeInMB} MB` : `${fileSizeInKB} KB`;

    // Get mime type
    const mimeType = resourceFile.type || 'image/jpeg';
    const mime: TMimeType = {
      type: "MimeType.Static" as const,
      value: mimeType
    };

    // Get resolution from image
    const getImageResolution = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const resolution = `${img.width}x${img.height}`;
          URL.revokeObjectURL(url);
          resolve(resolution);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('1920x1080');
        };
        img.src = url;
      });
    };

    const resolution = await getImageResolution(resourceFile);
    const mime: TMimeType = { type: "MimeType.Static" as const, value: mimeType };

    const payload: TForm = {
      ...values,
      resolution,
      size,
      mime,
      resourceFiles,
      thumbFiles,
    };
    onSubmit(payload);
  } else {
    // No new resource file — keep existing URL
    const payload: TForm = {
      ...values,
      resourceFiles,
      thumbFiles,
    };
    onSubmit(payload);
  }
};
```

NOTE: The existing code already handles the else case (no new file). The only change needed is: remove the duplicate `mime` declaration in the `if (resourceFile)` branch. The existing code already has `resourceUrl` and `thumbUrl` coming from `values` (which will have them from `initialValues`). The existing code is mostly correct — just verify the `else` branch preserves existing URLs.

- [ ] **Step 3: Verify the else branch preserves existing URLs**
Read the existing `onFinish` function. In the `else` branch (no resourceFile), verify it sends `values.resourceFiles` and `values.thumbFiles` which would be undefined arrays. The existing code at the `else` branch does `onSubmit(payload)` with `resourceFiles` and `thumbFiles` — these are the state arrays (always empty on update if no new file uploaded).

The real issue: on update, we need to send the existing `resourceUrl`/`thumbUrl` from `initialValues` as the URL string (not undefined). Since `initialValues` is set via `form.setFieldsValue()`, the form will have those values. So `values.resourceUrl` on submit will be the existing URL from initialValues if no new file was uploaded. This already works correctly. Only verify, no code change needed.

- [ ] **Step 4: Commit**

---

## Task 5: FE - UploadMedia: Pre-populate Existing Files (CRITICAL)

**Files:**
- Modify: `src/components/form/UploadMedia.tsx`
- Modify: `src/components/form/FormMedia.tsx`

**Problem:** `UploadMedia` manages `fileList` internally via a `useUpload` ref. It does NOT use the `fileList` prop passed from parent, so existing files from `initialValues` (for update mode) will not display.

**Context from code analysis:**
- `useUpload` at line 84: `const fileList = useRef<TFileList[]>([])`
- Line 170: `<Upload fileList={mediaHandler.fileList} ...>` — always uses internal state, not `rest.fileList`
- Line 63-69: `useEffect` syncs external `rest.fileList` → internal only when DIFFERENT (by uid comparison), so new files from parent don't auto-populate

- [ ] **Step 1: Read UploadMedia and FormMedia**
Read: `src/components/form/UploadMedia.tsx`
Read: `src/components/form/FormMedia.tsx`

- [ ] **Step 2: Add `initialFiles` prop to UploadMedia**

In `UploadMedia.tsx`, add `initialFiles` to the destructured props (after `onFilesChange`):

```tsx
const UploadMedia = ({
  // ... existing props
  onFilesChange,
  initialFiles,  // NEW: existing files from initialValues (update mode)
  ...rest
}: TProps) => {
```

In `TProps`, add:
```tsx
type TProps = Omit<UploadProps, 'onChange'> & {
  // ... existing fields
  initialFiles?: TFileType[];  // NEW
};
```

- [ ] **Step 3: Initialize component with existing files**

After the `useUpload()` call (around line 54), add a `useEffect` to populate the component with existing files when `initialFiles` is provided:

```tsx
// Populate with existing files on mount (for update mode)
const { setFileList: setMediaFileList } = mediaHandler;
useEffect(() => {
  if (initialFiles && initialFiles.length > 0) {
    const previewList: TFileList[] = initialFiles.map((file: TFileType, idx: number) => ({
      ...file,
      uid: (file as TFileList).uid || `initial-${idx}`,
      url: file.url || (file as TFileList).thumbUrl || '',
      status: 'done' as const,
    }));
    setMediaFileList(previewList);
    setLocalFiles(initialFiles);
    // Also notify parent via onFilesChange
    if (onFilesChange) onFilesChange(initialFiles);
  }
}, [initialFiles]);
```

Note: `setFileList` is not directly exposed by `useUpload`. Instead, use `mediaHandler.setFileList` by calling it via the returned `setFileList` reference. Check what `useUpload` returns at line 324 — if it returns `setFileList` in the return object, use it. If not, add it.

If `setFileList` is not exported from `useUpload`, add it to the return:
```tsx
return {
  fileList: fileList.current,
  setFileList,    // ADD THIS LINE
  beforeUpload,
  upload,
  normFile,
  EditFileButton,
  avatarUploadClassName,
};
```

- [ ] **Step 4: Forward `initialFiles` from FormMedia**

In `FormMedia.tsx`, add `initialFiles` to the props interface and forward it to `UploadMedia`:

```tsx
interface IProps<TForm> extends FormItemProps {
  // ... existing
  initialFiles?: TFileType[];  // ADD
}

const FormMedia = <TForm,>({
  // ... existing destructuring
  initialFiles,  // ADD
  ...rest
}: IProps<TForm>) => {
  // ...
  <UploadMedia
    {...rest}
    initialFiles={initialFiles}  // ADD
  />
};
```

- [ ] **Step 5: Test — verify upload component shows existing files in update mode**

This cannot be tested in isolation without the running app. The e2e tests will verify this. Proceed to Task 6 to wire it up.

- [ ] **Step 6: Commit**

---

## Task 6: FE - Wallpaper Edit Client Component

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/app/(protected)/admin/wallpaper/[id]/detail/WallpaperDetailClient.tsx`

**Context:**
- Currently read-only detail page
- Need to add edit mode: when "Edit" button clicked, form becomes editable with Save/Cancel
- `UploadMedia` now supports `initialFiles` (Task 5)

- [ ] **Step 1: Read current WallpaperDetailClient**
Read: `src/app/(protected)/admin/wallpaper/[id]/detail/WallpaperDetailClient.tsx`

- [ ] **Step 2: Rewrite as WallpaperDetailClient with edit mode**
Replace the entire file content with:
```tsx
"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import ButtonSave from "@/components/form/ButtonSave";
import Section from "@/components/ui/Section";
import { TFormRef } from "@/data/type";
import WallpaperForm from "@/features/wallpaper/components/form/WallpaperForm";
import useGetWallpaperDetail from "@/features/wallpaper/hooks/useGetWallpaperDetail";
import WallpaperServices from "@/features/wallpaper/services";
import UploadServices from "@/services/upload.service";
import { TFileType } from "@/hooks/useUpload";
import { TForm } from "@/features/wallpaper/components/form/WallpaperForm";
import { TSaveWallpaperPayload } from "@/features/wallpaper/data/type";
import { showSuccessToast, showToast } from "@/lib/error";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { WALLPAPER } from "@/features/wallpaper/data/type";
import { IResponseError } from "@/lib/service/utility";

interface WallpaperDetailClientProps {
  wallpaperId: number;
}

export default function WallpaperDetailClient({ wallpaperId }: WallpaperDetailClientProps) {
  const { data: wallpaper, isLoading } = useGetWallpaperDetail(wallpaperId);
  const ref = useRef<TFormRef>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: TFileType,
    type: string,
    categoryId: number,
    fileName: string
  ): Promise<string> => {
    const response = await UploadServices.uploadFile({
      file: file,
      categoryId: categoryId.toString(),
      type,
      name: fileName,
    });
    return response.path;
  };

  const onSuccess = () => {
    showSuccessToast("save", WALLPAPER.LIST, "Wallpaper updated");
    queryClient.invalidateQueries({ queryKey: [WALLPAPER.LIST] });
    queryClient.invalidateQueries({ queryKey: [WALLPAPER.DETAIL, wallpaperId] });
    setIsEditing(false);
  };

  const onError = (error: IResponseError<unknown>) => {
    showToast("server", (error as { message?: string }).message || "Failed to update wallpaper");
  };

  const onSubmit = async (values: TForm) => {
    if (!wallpaper) return;
    setIsUploading(true);

    try {
      let resourceUrl: string | undefined = values.resourceUrl;
      let thumbUrl: string | undefined = values.thumbUrl;

      const resourceFile = values.resourceFiles?.[0];
      if (resourceFile) {
        resourceUrl = await uploadFile(resourceFile, "content", Number(values.categoryId), values.name);
      }

      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile) {
        thumbUrl = await uploadFile(thumbFile, "thumb", Number(values.categoryId), values.name);
      }

      const payload: TSaveWallpaperPayload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        tags: values.tags ?? "",
        resolution: values.resolution ?? "",
        size: values.size ?? "",
        mime: values.mime,
        resourceUrl: resourceUrl ?? "",
        thumbUrl: thumbUrl ?? "",
      };

      await WallpaperServices.updateWallpaper(wallpaperId, payload);
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      onError(error as IResponseError<unknown>);
    } finally {
      setIsUploading(false);
    }
  };

  const initialValues = wallpaper
    ? {
        categoryId: wallpaper.category_id,
        name: wallpaper.name,
        resolution: wallpaper.resolution,
        size: wallpaper.size,
        mime: wallpaper.mime,
        tags: wallpaper.tags,
        resourceUrl: wallpaper.resourceUrl,
        thumbUrl: wallpaper.thumbUrl,
        resourceFiles: wallpaper.resourceUrl
          ? [{ uid: "resource-1", name: wallpaper.name, url: wallpaper.resourceUrl, thumbUrl: wallpaper.thumbUrl } as unknown as TFileType]
          : [],
        thumbFiles: wallpaper.thumbUrl
          ? [{ uid: "thumb-1", name: `${wallpaper.name}_thumb`, url: wallpaper.thumbUrl, thumbUrl: wallpaper.thumbUrl } as unknown as TFileType]
          : [],
      }
    : undefined;

  return (
    <Spin spinning={isLoading || isUploading}>
      <Section>
        <Flex align="center" justify="space-between">
          <Title level={5} className="m-0">
            {wallpaper?.name ?? "Detail Wallpaper"}
          </Title>
          <Flex gap={12}>
            {isEditing ? (
              <>
                <ButtonCancel onClick={() => setIsEditing(false)} />
                <ButtonSave onClick={() => ref.current?.submit()} />
              </>
            ) : (
              <ButtonCancel href={"/admin/wallpaper"} />
            )}
          </Flex>
        </Flex>

        <WallpaperForm
          ref={ref}
          readOnly={!isEditing}
          initialValues={initialValues}
          onSubmit={isEditing ? onSubmit : undefined}
        />
      </Section>
    </Spin>
  );
}
```

Note: `ButtonSave` and `ButtonCancel` accept an `onClick` prop for programmatic use (not just href). Verify if they support this. If `ButtonSave` only supports `href`, replace the Save button with a plain `<button>` styled like ButtonSave:
```tsx
<button
  onClick={() => ref.current?.submit()}
  className="ant-btn ant-btn-primary"
>
  Save
</button>
```

- [ ] **Step 3: Commit**

---

## Task 6: FE - Category Update Service Method

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/features/category/services/index.ts`

- [ ] **Step 1: Read current category service**
Read: `src/features/category/services/index.ts`

- [ ] **Step 2: Add updateCategory method**
After `addCategory`, add:
```ts
static updateCategory(id: number, payload: TSaveCategoryPayload) {
  return API.put<TCategory>(`${CategoryServices.basePath}/${id}`, payload);
}
```

- [ ] **Step 3: Commit**

---

## Task 7: FE - Category Edit Client Component

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/app/(protected)/admin/category/[id]/detail/CategoryDetailClient.tsx`

- [ ] **Step 1: Read current CategoryDetailClient**
Read: `src/app/(protected)/admin/category/[id]/detail/CategoryDetailClient.tsx`

- [ ] **Step 2: Rewrite with edit mode**
Replace the entire file content with:
```tsx
"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import { TFormRef } from "@/data/type";
import CategoryForm from "@/features/category/components/form/CategoryForm";
import useGetCategoryDetail from "@/features/category/hooks/useGetCategoryDetail";
import CategoryServices from "@/features/category/services";
import UploadServices from "@/services/upload.service";
import { TCategoryForm } from "@/features/category/components/form/CategoryForm";
import { TSaveCategoryPayload } from "@/features/category/data/type";
import { showSuccessToast, showToast } from "@/lib/error";
import { TFileType } from "@/hooks/useUpload";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CATEGORY } from "@/features/category/data/type";
import { IResponseError } from "@/lib/service/utility";

interface CategoryDetailClientProps {
  categoryId: number;
}

export default function CategoryDetailClient({ categoryId }: CategoryDetailClientProps) {
  const { data: category, isLoading } = useGetCategoryDetail(categoryId);
  const ref = useRef<TFormRef>(null);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: TFileType, fileName: string): Promise<string> => {
    const response = await UploadServices.uploadFile({
      file,
      categoryId: categoryId.toString(),
      type: "thumb",
      name: fileName,
    });
    return response.path;
  };

  const onSuccess = () => {
    showSuccessToast("save", CATEGORY.LIST, "Category updated");
    queryClient.invalidateQueries({ queryKey: [CATEGORY.LIST] });
    queryClient.invalidateQueries({ queryKey: ["category-detail", categoryId] });
    setIsEditing(false);
  };

  const onError = (error: IResponseError<unknown>) => {
    showToast("server", (error as { message?: string }).message || "Failed to update category");
  };

  const onSubmit = async (values: TCategoryForm) => {
    setIsUploading(true);
    try {
      let thumbUrl: string | undefined = values.thumbUrl;

      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile) {
        thumbUrl = await uploadFile(thumbFile, values.name || "category");
      }

      const payload: TSaveCategoryPayload = {
        name: values.name,
        thumbUrl: thumbUrl ?? "",
      };

      await CategoryServices.updateCategory(categoryId, payload);
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      onError(error as IResponseError<unknown>);
    } finally {
      setIsUploading(false);
    }
  };

  const initialValues = category
    ? {
        name: category.name,
        thumbFiles: category.thumbUrl
          ? [{ uid: "thumb-1", name: `${category.name}_thumb`, url: category.thumbUrl, thumbUrl: category.thumbUrl } as unknown as TFileType]
          : [],
      }
    : undefined;

  return (
    <Spin spinning={isLoading || isUploading}>
      <Section>
        <Flex align="center" justify="space-between">
          <Title level={5} className="m-0">
            {category?.name ?? "Detail Category"}
          </Title>
          <Flex gap={12}>
            {isEditing ? (
              <>
                <ButtonCancel onClick={() => setIsEditing(false)} />
                <button onClick={() => ref.current?.submit()} className="ant-btn ant-btn-primary ant-btn-default">Save</button>
              </>
            ) : (
              <ButtonCancel href={"/admin/category"} />
            )}
          </Flex>
        </Flex>

        <CategoryForm
          ref={ref}
          readOnly={!isEditing}
          initialValues={initialValues}
          onSubmit={isEditing ? onSubmit : undefined}
        />
      </Section>
    </Spin>
  );
}
```

- [ ] **Step 3: Fix CategoryTable Edit link**
Read: `src/features/category/components/CategoryTable.tsx`

Find the Edit action link. Replace:
```tsx
// FROM:
href={`/admin/wallpaper/${record.id}/detail`}
// TO:
href={`/admin/category/${record.id}/detail`}
```

- [ ] **Step 4: Commit**

---

## Task 8: FE - Menu Update Service Method

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/features/menu/services/index.ts`

- [ ] **Step 1: Read current menu service**
Read: `src/features/menu/services/index.ts`

- [ ] **Step 2: Add updateMenu method**
After `addMenu`, add:
```ts
static updateMenu(id: number, payload: TSaveMenuPayload) {
  return API.put<TMenu>(`${MenuServices.basePath}/${id}`, payload);
}
```

- [ ] **Step 3: Commit**

---

## Task 9: FE - Menu Detail: Add Edit Mode

**Frontend file:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin/src/app/(protected)/admin/menu/[id]/detail/MenuDetailClient.tsx`

**Context:**
- Currently read-only
- Add edit mode toggle with Edit/Save/Cancel buttons
- Menu update cannot change wallpaper_id or category_id — only filter, queryOrder, page, index_in_page

- [ ] **Step 1: Read current MenuDetailClient**
Read: `src/app/(protected)/admin/menu/[id]/detail/MenuDetailClient.tsx`

- [ ] **Step 2: Rewrite with edit mode**
Replace the entire file content with:
```tsx
"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import useGetMenuDetail from "@/features/menu/hooks/useGetMenuDetail";
import MenuServices from "@/features/menu/services";
import { TMenuForm } from "@/features/menu/components/form/MenuForm";
import { TSaveMenuPayload } from "@/features/menu/data/type";
import { showSuccessToast, showToast } from "@/lib/error";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MENU } from "@/features/menu/data/type";
import { IResponseError } from "@/lib/service/utility";

interface MenuDetailClientProps {
  menuId: number;
}

export default function MenuDetailClient({ menuId }: MenuDetailClientProps) {
  const { data: menu, isLoading } = useGetMenuDetail(menuId);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const onSuccess = () => {
    showSuccessToast("save", MENU.LIST, "Menu updated");
    queryClient.invalidateQueries({ queryKey: [MENU.LIST] });
    queryClient.invalidateQueries({ queryKey: ["menu-detail", menuId] });
    setIsEditing(false);
  };

  const onError = (error: IResponseError<unknown>) => {
    showToast("server", (error as { message?: string }).message || "Failed to update menu");
  };

  const handleSubmit = async (values: TMenuForm) => {
    const payload: TSaveMenuPayload = {
      filter: values.filter,
      queryOrder: values.queryOrder,
      page: values.page,
      index_in_page: values.index_in_page,
      wallpaper_id: menu?.wallpaper_id ?? 0,
      category_id: menu?.category_id ?? 0,
    };

    try {
      await MenuServices.updateMenu(menuId, payload);
      onSuccess();
    } catch (error) {
      onError(error as IResponseError<unknown>);
    }
  };

  return (
    <Spin spinning={isLoading}>
      <Section>
        <Flex align="center" justify="space-between">
          <Title level={5} className="m-0">
            {menu?.wallpaperName ?? "Detail Menu"}
          </Title>
          <Flex gap={12}>
            {isEditing ? (
              <>
                <ButtonCancel onClick={handleCancel} />
                <button
                  onClick={() => {
                    // The form will call handleSubmit via MenuForm onSubmit
                    // We need to wire this up — see Note below
                  }}
                  className="ant-btn ant-btn-primary ant-btn-default"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button onClick={handleEdit} className="ant-btn ant-btn-default">
                  Edit
                </button>
                <ButtonCancel href={"/admin/menu"} />
              </>
            )}
          </Flex>
        </Flex>

        {/* Read-only view */}
        {!isEditing && menu && (
          <div className="mt-6">
            <div className="bg-white p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wallpaper Name</label>
                  <div className="p-3 bg-gray-50 rounded border">{menu.wallpaperName || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <div className="p-3 bg-gray-50 rounded border">{menu.categoryName || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
                  <div className="p-3 bg-gray-50 rounded border">{menu.filter || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
                  <div className="p-3 bg-gray-50 rounded border">{menu.page ?? "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Index in Page</label>
                  <div className="p-3 bg-gray-50 rounded border">{menu.index_in_page ?? "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Order</label>
                  <div className="p-3 bg-gray-50 rounded border">{menu.queryOrder || "N/A"}</div>
                </div>
                {menu.thumbUrl && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <Image src={menu.thumbUrl} alt={menu.wallpaperName} width={128} height={128} className="object-cover rounded" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {isEditing && menu && (
          <div className="mt-6">
            <MenuFormEdit
              initialValues={{
                filter: menu.filter as any,
                queryOrder: menu.queryOrder as any,
                page: menu.page,
                index_in_page: menu.index_in_page,
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}
      </Section>
    </Spin>
  );
}

// Inline editable form component (since MenuForm is read-only detail)
import MenuForm from "@/features/menu/components/form/MenuForm";
```

NOTE: The `MenuFormEdit` approach above is complex. Instead, reuse `MenuForm` with a `ref` pattern similar to wallpaper/category. Since `MenuForm` uses `forwardRef` and exposes `submit()` via `useImperativeHandle`, a cleaner approach is to add a ref and call `ref.current?.submit()`.

Better approach: Instead of rewriting the whole file, add state and conditionally render the form or read-only view. Use a ref for the form submit. The save button should call `ref.current?.submit()`.

Final implementation should:
1. Add `const formRef = useRef<TFormRef>(null);`
2. When Edit is clicked, show the `MenuForm` with `ref={formRef}` and `onSubmit={handleSubmit}`
3. Save button calls `formRef.current?.submit()`
4. Cancel button calls `setIsEditing(false)` and optionally resets form

- [ ] **Step 3: Fix MenuTable Edit link**
Read: `src/features/menu/components/MenuTable.tsx`

Find the Edit action link. Replace:
```tsx
// FROM:
href={`/admin/wallpaper/${record.id}/detail`}
// TO:
href={`/admin/menu/${record.id}/detail`}
```

- [ ] **Step 4: Commit**


---

## Task 10: E2E - Setup: sample.png Fixture

**Files:**
- Create: `e2e/fixtures/sample.png`

- [ ] **Step 1: Create a small test PNG file**

Create a 1x1 pixel PNG using Python and save it:
Run: `python3 -c "import struct,zlib; data=struct.pack('>II',1,1)+b'\x08\x02\x00\x00\x00'; h=struct.pack('>4sIII',b'IHDR',1,1,8)+b'\x02\x00\x00\x00'; ihdr=zlib.crc32(b'IHDR'+struct.pack('>II',1,1)+b'\x08\x02'); idat=zlib.crc32(b'IDAT'+data); with open('e2e/fixtures/sample.png','wb') as f: f.write(b'\x89PNG\r\n\x1a\n'+h+struct.pack('>I', ihdr)+b'IDAT'+data+struct.pack('>I',idat)+b'IEND\x0d\xbc\x00\x00')" 2>/dev/null || python3 -c "
import base64
png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
with open('e2e/fixtures/sample.png','wb') as f: f.write(base64.b64decode(png))
"
`
Expected: `e2e/fixtures/sample.png` created (~68 bytes)

OR use curl to download a reliable small PNG from a public source:
Run: `mkdir -p e2e/fixtures && curl -s -o e2e/fixtures/sample.png https://www.w3.org/2000/svg/img/png1.png 2>/dev/null || echo "curl failed"`

Then verify file size:
Run: `ls -la e2e/fixtures/sample.png`
Expected: File exists, < 100KB

- [ ] **Step 2: Commit**

---

## Task 11: E2E - Helpers: fixtures/helpers.ts

**Files:**
- Create: `e2e/fixtures/helpers.ts`

- [ ] **Step 1: Create e2e/fixtures directory and helpers file**
Run: `mkdir -p e2e/fixtures`

- [ ] **Step 2: Write helpers file**

Create `e2e/fixtures/helpers.ts` with:

```ts
import { Page, APIRequestContext } from '@playwright/test';
import path from 'path';

// Admin credentials (from seeded data)
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin123'; // Verify this matches your seed

// Set localStorage auth tokens directly (for non-auth tests)
export function setAuthTokens(page: Page, accessToken: string, refreshToken: string) {
  const futureExpiry = Date.now() + 1000 * 60 * 60;
  page.evaluate(({ accessToken, refreshToken, expiry }) => {
    localStorage.setItem('fingerprint', 'test-fingerprint');
    localStorage.setItem('tokens', JSON.stringify({
      accessToken,
      refreshToken,
      expiresAt: expiry,
      remember: true,
    }));
    localStorage.setItem('user', JSON.stringify({
      user: { id: 1, username: 'admin' },
      expiresAt: expiry,
    }));
  }, { accessToken, refreshToken, expiry: futureExpiry });
}

// Clear all localStorage auth data
export function clearAuthTokens(page: Page) {
  page.evaluate(() => {
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    localStorage.removeItem('fingerprint');
  });
}

// Standard UI login (uses seeded admin credentials)
export async function login(page: Page, username?: string, password?: string) {
  await page.goto('/auth/signin');
  await page.fill('input[placeholder*="username"], input[name="username"]', username || ADMIN_USERNAME);
  await page.fill('input[placeholder*="password"], input[name="password"]', password || ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/wallpaper', { timeout: 10000 });
}

// Cleanup helpers using page.request (Playwright API client - respects cookies/localStorage)
export async function cleanupWallpaper(page: Page, id: number) {
  const resp = await page.request.delete(`http://localhost:3001/api/v1/admin/wallpaper/${id}`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken(page)}`,
    },
  });
  // 200 or 404 is fine — 404 means already deleted
  if (!resp.ok() && resp.status() !== 404) {
    console.warn(`Failed to cleanup wallpaper ${id}: ${resp.status()}`);
  }
}

export async function cleanupCategory(page: Page, id: number) {
  const resp = await page.request.delete(`http://localhost:3001/api/v1/wallpaper/category/${id}`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken(page)}`,
    },
  });
  if (!resp.ok() && resp.status() !== 404) {
    console.warn(`Failed to cleanup category ${id}: ${resp.status()}`);
  }
}

export async function cleanupMenu(page: Page, id: number) {
  const resp = await page.request.delete(`http://localhost:3001/api/v1/wallpaper/menu/${id}`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken(page)}`,
    },
  });
  if (!resp.ok() && resp.status() !== 404) {
    console.warn(`Failed to cleanup menu ${id}: ${resp.status()}`);
  }
}

async function getAccessToken(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const tokens = localStorage.getItem('tokens');
    if (!tokens) return '';
    try {
      return JSON.parse(tokens).accessToken || '';
    } catch {
      return '';
    }
  });
}

// Get path to sample.png fixture
export function samplePngPath(): string {
  return path.join(__dirname, 'sample.png');
}
```

Note: `ADMIN_PASSWORD` must match the seeded admin password. Check your seed file at `/Users/tuanvq/Documents/Projects/Personal/file-management/prisma/seed/index.ts` to confirm the password.

- [ ] **Step 3: Commit**

---

## Task 12: E2E - auth.spec.ts

**Files:**
- Create: `e2e/auth.spec.ts`

- [ ] **Step 1: Write auth.spec.ts**

Create `e2e/auth.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { login, clearAuthTokens, ADMIN_USERNAME, ADMIN_PASSWORD } from './fixtures/helpers';

test.describe('Auth', () => {

  test('successful login redirects to admin wallpapers', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[placeholder*="username"], input[name="username"]', ADMIN_USERNAME);
    await page.fill('input[placeholder*="password"], input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/wallpaper', { timeout: 10000 });
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('failed login shows error and stays on signin', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[placeholder*="username"], input[name="username"]', 'wronguser');
    await page.fill('input[placeholder*="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Stay on signin page
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });
    // Error toast/alert should appear
    await expect(page.locator('.ant-message-notice-content, .ant-alert')).toBeVisible({ timeout: 5000 });
  });

  test('logout clears tokens and redirects to signin', async ({ page }) => {
    // Login first
    await login(page);
    // Verify logged in
    await expect(page).toHaveURL('/admin/wallpaper');

    // Click logout
    await page.locator('button:has-text("Logout")').click();

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });

    // Tokens should be cleared
    const tokens = await page.evaluate(() => localStorage.getItem('tokens'));
    expect(tokens).toBeNull();
  });

});
```

- [ ] **Step 2: Run the tests to verify they pass**

Prerequisites: frontend on port 3005, backend accessible at port 3001

Run: `npx playwright test e2e/auth.spec.ts --reporter=line`
Expected: All 3 tests pass

If login fails, check `ADMIN_PASSWORD` in helpers.ts matches seeded password.

- [ ] **Step 3: Commit**

---

## Task 13: E2E - category.spec.ts

**Files:**
- Create: `e2e/category.spec.ts`

- [ ] **Step 1: Write category.spec.ts**

Create `e2e/category.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { login, cleanupCategory, ADMIN_USERNAME, ADMIN_PASSWORD, samplePngPath } from './fixtures/helpers';

test.describe('Category', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('category list loads with seeded data', async ({ page }) => {
    await page.goto('/admin/category');
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });
    // Check at least one row (seeded categories)
    await expect(page.locator('.ant-table-tbody tr')).toHaveCount({ minimum: 1 }, { timeout: 5000 });
  });

  test('create category with thumbnail upload', async ({ page }) => {
    const categoryName = `Test Category E2E ${Date.now()}`;

    await page.goto('/admin/category/create');
    await page.fill('input[name="category.name"]', categoryName);

    // Upload thumbnail
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(samplePngPath());

    // Click Save
    await page.locator('button:has-text("Save"), button[type="submit"]').first().click();

    // Redirect to list
    await expect(page).toHaveURL('/admin/category', { timeout: 10000 });

    // Verify new category appears in table
    await expect(page.locator(`.ant-table`, { hasText: categoryName })).toBeVisible({ timeout: 5000 });

    // Find the category ID from the table and cleanup
    const rows = await page.locator('.ant-table-tbody tr').all();
    for (const row of rows) {
      const text = await row.textContent();
      if (text?.includes(categoryName)) {
        // Click the row to get to detail, extract ID from URL
        await row.click();
        await expect(page).toHaveURL(/\/admin\/category\/\d+\/detail/);
        const url = page.url();
        const match = url.match(/\/category\/(\d+)\/detail/);
        if (match) {
          const categoryId = parseInt(match[1]);
          // Navigate back and delete via API
          await page.goto('/admin/category');
          await cleanupCategory(page, categoryId);
        }
        break;
      }
    }
  });

  test('category detail view is read-only', async ({ page }) => {
    await page.goto('/admin/category');
    // Click first row
    await page.locator('.ant-table-tbody tr').first().click();
    await expect(page).toHaveURL(/\/admin\/category\/\d+\/detail/, { timeout: 5000 });

    // Fields should be read-only (no input enabled, no Save button visible)
    const disabledInputs = page.locator('input[disabled], input[readonly]');
    await expect(disabledInputs.first()).toBeVisible({ timeout: 3000 });
  });

});
```

- [ ] **Step 2: Run the tests**
Run: `npx playwright test e2e/category.spec.ts --reporter=line`
Expected: Tests pass

- [ ] **Step 3: Commit**

---

## Task 14: E2E - wallpaper.spec.ts

**Files:**
- Create: `e2e/wallpaper.spec.ts`

- [ ] **Step 1: Write wallpaper.spec.ts**

Create `e2e/wallpaper.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { login, cleanupWallpaper, ADMIN_USERNAME, ADMIN_PASSWORD, samplePngPath } from './fixtures/helpers';

test.describe('Wallpaper', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('wallpaper list loads with pagination', async ({ page }) => {
    await page.goto('/admin/wallpaper');
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });
    // Check pagination controls
    await expect(page.locator('.ant-pagination')).toBeVisible({ timeout: 3000 });
  });

  test('create wallpaper with resource + thumbnail upload', async ({ page }) => {
    const wallpaperName = `Test Wallpaper E2E ${Date.now()}`;

    await page.goto('/admin/wallpaper/create');

    // Select first category
    const categorySelect = page.locator('.ant-select').first();
    await categorySelect.click();
    await page.locator('.ant-select-dropdown .ant-select-item').first().click();

    // Fill name
    await page.fill('input[name="wallpaper.name"]', wallpaperName);

    // Fill tags
    await page.fill('input[name="wallpaper.tags"]', 'e2e, test');

    // Upload resource file (first file input)
    const resourceInput = page.locator('input[type="file"]').first();
    await resourceInput.setInputFiles(samplePngPath());

    // Wait a bit for the upload to start
    await page.waitForTimeout(500);

    // Upload thumbnail (second file input)
    const thumbInput = page.locator('input[type="file"]').nth(1);
    await thumbInput.setInputFiles(samplePngPath());

    // Click Save
    await page.locator('button:has-text("Save"), button[type="submit"]').first().click();

    // Redirect to list
    await expect(page).toHaveURL('/admin/wallpaper', { timeout: 15000 });

    // Verify wallpaper appears
    await expect(page.locator('.ant-table', { hasText: wallpaperName })).toBeVisible({ timeout: 5000 });

    // Cleanup: find wallpaper ID and delete
    const rows = await page.locator('.ant-table-tbody tr').all();
    for (const row of rows) {
      const text = await row.textContent();
      if (text?.includes(wallpaperName)) {
        await row.click();
        await expect(page).toHaveURL(/\/admin\/wallpaper\/\d+\/detail/);
        const match = page.url().match(/\/wallpaper\/(\d+)\/detail/);
        if (match) {
          const wallpaperId = parseInt(match[1]);
          await cleanupWallpaper(page, wallpaperId);
        }
        break;
      }
    }
  });

  test('wallpaper detail view is read-only', async ({ page }) => {
    await page.goto('/admin/wallpaper');
    await page.locator('.ant-table-tbody tr').first().click();
    await expect(page).toHaveURL(/\/admin\/wallpaper\/\d+\/detail/, { timeout: 5000 });

    // Fields should be read-only
    const disabledInputs = page.locator('input[disabled], input[readonly]');
    await expect(disabledInputs.first()).toBeVisible({ timeout: 3000 });
  });

});
```

- [ ] **Step 2: Run the tests**
Run: `npx playwright test e2e/wallpaper.spec.ts --reporter=line`
Expected: Tests pass

- [ ] **Step 3: Commit**

---

## Task 15: E2E - menu.spec.ts

**Files:**
- Create: `e2e/menu.spec.ts`

- [ ] **Step 1: Write menu.spec.ts**

Create `e2e/menu.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { login, cleanupMenu, cleanupWallpaper, ADMIN_USERNAME, ADMIN_PASSWORD, samplePngPath } from './fixtures/helpers';

test.describe('Menu', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('menu list loads', async ({ page }) => {
    await page.goto('/admin/menu');
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });
  });

  test('create menu via wallpaper table modal', async ({ page }) => {
    // First ensure a wallpaper exists - navigate to wallpaper list
    await page.goto('/admin/wallpaper');

    // Create a wallpaper if none exist (check table rows)
    const rowCount = await page.locator('.ant-table-tbody tr').count();

    let wallpaperId: number | null = null;
    let categoryId: number | null = null;

    if (rowCount === 0) {
      // Create a wallpaper first
      await page.goto('/admin/wallpaper/create');
      const wallpaperName = `Test Wallpaper for Menu ${Date.now()}`;
      await page.fill('input[name="wallpaper.name"]', wallpaperName);
      await page.fill('input[name="wallpaper.tags"]', 'e2e, menu-test');
      await page.locator('input[type="file"]').first().setInputFiles(samplePngPath());
      await page.waitForTimeout(300);
      await page.locator('input[type="file"]').nth(1).setInputFiles(samplePngPath());
      await page.locator('button:has-text("Save"), button[type="submit"]').first().click();
      await expect(page).toHaveURL('/admin/wallpaper', { timeout: 15000 });
    }

    // Navigate to wallpaper list and open Create Menu modal
    await page.goto('/admin/wallpaper');
    await page.waitForSelector('.ant-table', { timeout: 10000 });

    // Click the "..." dropdown on first row
    const moreButton = page.locator('.ant-table-tbody tr').first().locator('[aria-label="more"], .anticon-more');
    await moreButton.click();
    await page.waitForSelector('.ant-dropdown-menu, .ant-dropdown-menu-item', { timeout: 3000 });

    // Click "Create Menu"
    const createMenuItem = page.locator('.ant-dropdown-menu-item, .ant-dropdown-menu .ant-dropdown-menu-item').filter({ hasText: /create menu/i });
    await createMenuItem.click();

    // Modal should open
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5000 });

    // Fill menu form
    await page.locator('.ant-select[name="filter"], .ant-select').first().click();
    await page.locator('.ant-select-item').filter({ hasText: /both/i }).first().click();

    await page.locator('.ant-select[name="queryOrder"], .ant-select').nth(1).click();
    await page.locator('.ant-select-item').filter({ hasText: /popular/i }).first().click();

    await page.locator('input[name="page"], input.ant-input-number').first().fill('1');
    await page.locator('input[name="index_in_page"], input.ant-input-number').nth(1).fill('1');

    // Submit modal
    await page.locator('.ant-modal button:has-text("Create Menu"), .ant-modal button[type="submit"]').click();

    // Modal should close
    await expect(page.locator('.ant-modal')).not.toBeVisible({ timeout: 5000 });

    // Navigate to menu list and verify
    await page.goto('/admin/menu');
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

    // Find menu ID and cleanup
    const menuRows = await page.locator('.ant-table-tbody tr').all();
    for (const row of menuRows) {
      const text = await row.textContent();
      // Look for the most recently created (it should be at the top)
      if (text && !text.includes('No data')) {
        await row.click();
        await expect(page).toHaveURL(/\/admin\/menu\/\d+\/detail/);
        const match = page.url().match(/\/menu\/(\d+)\/detail/);
        if (match) {
          const menuId = parseInt(match[1]);
          await cleanupMenu(page, menuId);
        }
        break;
      }
    }
  });

  test('menu detail view loads', async ({ page }) => {
    await page.goto('/admin/menu');
    await page.waitForSelector('.ant-table', { timeout: 10000 });

    // Check if any data exists
    const hasRows = await page.locator('.ant-table-tbody tr').count() > 0;

    if (hasRows) {
      await page.locator('.ant-table-tbody tr').first().click();
      await expect(page).toHaveURL(/\/admin\/menu\/\d+\/detail/, { timeout: 5000 });
      // Check some field is visible
      await expect(page.locator('label, .text-sm')).toHaveCount({ minimum: 1 }, { timeout: 3000 });
    } else {
      // No menu data — skip this test silently or mark as todo
      console.log('No menu data found — skipping detail view test');
    }
  });

});
```

- [ ] **Step 2: Run the tests**
Run: `npx playwright test e2e/menu.spec.ts --reporter=line`
Expected: Tests pass

- [ ] **Step 3: Commit**
