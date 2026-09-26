const fs=require('fs'),path=require('path');
const root=__dirname;
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>'<style>'+fs.readFileSync(path.join(root,'styles.css'),'utf8')+'</style>');
for(const name of ['lucide.min.js','app.js'])html=html.replace('<script src="'+name+'"></script>',()=>'<script>'+fs.readFileSync(path.join(root,name),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
fs.writeFileSync(path.join(root,'open-studios-showcase.html'),html);
console.log('Built offline showcase: '+Buffer.byteLength(html)+' bytes');
