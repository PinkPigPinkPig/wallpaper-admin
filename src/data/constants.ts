export enum Errors {
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
};

export const Regex = {
  Email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  ThousandsSeparator: /\B(?=(\d{3})+(?!\d))/g,
  TwoDecimalPlaces: /(\.\d{2})\d+/,
  NumberOnly: /^\d$/,
  YoutubeURL: /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
  VRUrl: /^(https?:\/\/)vr\.tophills\.com\.my\/.*/,
  Score: /(\.\d{2})\d+/,
  YoutubeEmbedURL:
    /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|.*[?&]v=)|youtu\.be\/)([^?&"'>]+)/,
};

export enum ProjectFileType {
 
}

export const DEFAULT_VALUES = {
  INPUT_MAX_LENGTH: 254,
};

export enum TimeType {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export const DATE_FORMAT = {
  YEAR: 'YYYY',
  YEAR_FIRST: 'YYYY-MM-DD',
  DAY_FIRST: 'DD/MM/YYYY',
  TIME_DAY_FIRST: 'HH:mm DD/MM/YYYY',
  FULL_TIME_DAY_FIRST: 'DD/MM/YYYY HH:mm:ss',
  DAY_MONTH: 'DD/MMM',
};