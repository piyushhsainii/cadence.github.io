const fs=require('fs'),path=require('path'),root=__dirname;
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const css of ['shell.css','luma.css'])html=html.replace('<link rel="stylesheet" href="'+css+'">',()=>'<style>'+fs.readFileSync(path.join(root,css),'utf8')+'</style>');
for(const js of ['lucide.min.js','app.js']){let code=fs.readFileSync(path.join(root,js),'utf8');if(js==='app.js')code=code.replace('src="reference.png"','src="data:image/png;base64,'+fs.readFileSync(path.join(root,'reference.png')).toString('base64')+'"');html=html.replace('<script src="'+js+'"></script>',()=>'<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>');}
fs.writeFileSync(path.join(root,'luma-showcase.html'),html);console.log('Built Luma offline document: '+Buffer.byteLength(html)+' bytes');
