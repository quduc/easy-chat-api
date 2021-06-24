export const AppConfig = {
  OTP: {
    MAX_TRIES: 5,
    LENGTH: 4,
    EXPIRE_TIME: 2 * 60,
  },
  SALT_ROUND: 10,
  TOURNAMENT_SETTING: {
    SUGGEST_TIME: 60,
    RESULT_TIME: 5,
    MIN_NUMBER_START: 3,
    CHECK_TOURNAMENT_STATE: '*/30 * * * * *',
    CHECK_NEXTSONG_PLAYING: '*/30 * * * * *',
    CHECK_TIME_RANGE_IN_SEC: 30,
  },
  EXT_IMG: ['JPG', 'JPEG', 'PNG', 'GIF', 'SVG'],
  MAX_FILE_UPLOAD: 5 * 1024 * 1024
};
