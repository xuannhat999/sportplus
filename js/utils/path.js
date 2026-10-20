function getAssetPath(path) {
  if (/^(https?:)?\/\//.test(path)) return path;
  return (document.body.dataset.root || "") + path;
}


