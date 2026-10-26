function getAssetPath(path) {
  if (/^(data:|https?:|blob:)/.test(path)) return path;
  if (/^(https?:)?\/\//.test(path)) return path;
  return (document.body.dataset.root || "") + path;
}


