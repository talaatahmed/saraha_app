export const fileTypes = {
  image: "image",
  video: "video",
  audio: "audio",
  application: "application",
};

export const allowedFileExtensions = {
  [fileTypes.image]: ["png", "jpg", "jpeg", "gif", "webp"],
  [fileTypes.videoideo]: ["mp4"],
  [fileTypes.audio]: ["mp3"],
  [fileTypes.application]: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
};
