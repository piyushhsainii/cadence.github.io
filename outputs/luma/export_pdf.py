from pathlib import Path
import json, math
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import pypdfium2 as pdfium

root=Path(__file__).parent;qa=root/'qa'
screens=json.loads((qa/'screen-data.json').read_text())
pdfmetrics.registerFont(TTFont('Luma','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('LumaBold','C:/Windows/Fonts/arialbd.ttf'))
light=Path('C:/Windows/Fonts/segoeuil.ttf')
pdfmetrics.registerFont(TTFont('LumaLight',str(light) if light.exists() else 'C:/Windows/Fonts/arial.ttf'))
BG='#0E110C';INK='#F1F4E9';MUTED='#9FAB92';LIME='#B7F12B';W,H=595.276,841.89
c=canvas.Canvas(str(root/'luma-client-showcase.pdf'),pagesize=(W,H))
c.setTitle('Luma - Expense Tracker / Mobile Experience Concept');c.setAuthor('Luma / Product Concept')
def txt(s,x,y,size=12,color=INK,font='Luma'):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,y,s)
def para(s,x,y,w=240,size=9,color=MUTED,leading=14):
    for line in simpleSplit(s,'Luma',size,w):txt(line,x,y,size,color);y-=leading
    return y
def bg(color=BG):c.setFillColor(HexColor(color));c.rect(0,0,W,H,fill=1,stroke=0)
def foot(n):txt('LUMA / MONEY, IN FOCUS.',36,25,7,'#7F946D');txt(f'{n:02}',W-50,25,8,'#7F946D')
def phone(id,x,y,w):
    im=Image.open(qa/(id+'.png'));h=w*im.height/im.width
    c.saveState();p=c.beginPath();p.roundRect(x,y,w,h,w*48/406);c.clipPath(p,fill=0,stroke=0);c.drawImage(ImageReader(im),x,y,w,h,mask='auto');c.restoreState()
bg('#030502');txt('LUMA',38,793,14,LIME,'LumaBold');txt('PRODUCT CONCEPT / 2026',W-190,793,8,MUTED)
txt('Your money.',36,718,51,INK,'LumaLight');txt('Less mystery.',36,657,51,LIME,'LumaLight')
para('A clearer view of daily spending, monthly budgets, and the subscriptions that quietly add up.',38,615,450,12,MUTED,18)
phone('overview',49,92,224);phone('subscriptions',316,92,224)
txt('17 connected screens. One calmer month.',38,65,12,INK)
txt('Interactive companion: luma-showcase.html',38,45,8,MUTED);foot(1);c.showPage()
titles=['A clearer view of the month','Every purchase, in context','Track what matters. Plan what is next.','A budget that fits your life','Understand spending and commitments','Stay ahead of the next charge','A useful heads-up','Find details. Make it yours.','The month, in perspective']
for group,start in enumerate(range(0,len(screens),2)):
    bg();txt('LUMA',36,H-34,10,LIME,'LumaBold');txt('MOBILE SCREEN COLLECTION',W-183,H-34,8,MUTED)
    txt(titles[group],36,H-77,22,INK,'LumaLight');para('A connected dark interface shaped by the supplied visual reference.',36,H-100,510,10,MUTED,15)
    for j,s in enumerate(screens[start:start+2]):
        x=36+j*271;phone(s['id'],x+5,193,242)
        txt(f'{start+j+1:02}  {s["label"]}',x,169,11,INK,'LumaBold');para(s['description'],x,146,242,9,MUTED,13)
    if len(screens[start:start+2])==1:
        x=307;txt('The visual system',x,680,19,INK,'LumaLight')
        for i,(heading,body) in enumerate([('Near-black foundation','Canvas #080A07. Raised surface #141711. Quiet dividers and open lists.'),('Luminous lime focus','Action #B7F12B. Forest #234D11. A green balance surface echoes the reference.'),('Light numerical typography','Large balances use light system sans-serif. Labels and body text stay clear.'),('A deliberate shape language','Soft outer corners, angled balance cutout, overlapping circles, and compact controls.'),('Connected calculations','One record set drives totals, category usage, monthly estimates, and alerts.')]):
            y=635-i*82;txt(heading,x,y,12,LIME);para(body,x,y-21,233,10,MUTED,15)
        para('Sample records. Device-local storage. No bank connection or real provider cancellation.',x,192,233,9,MUTED,14)
    c.setStrokeColor(HexColor('#2A3620'));c.line(36,67,W-36,67)
    para('Interactive version: luma-showcase.html. The sample snapshot is September 26, 2026, in USD. Projections are simple spending-pace estimates.',36,52,W-72,7,MUTED,10);foot(group+2);c.showPage()
c.save()
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
contact=Image.new('RGB',(1200,math.ceil(len(screens)/4)*650),BG);draw=ImageDraw.Draw(contact)
for i,s in enumerate(screens):
    im=Image.open(qa/(s['id']+'.png')).convert('RGB');im.thumbnail((280,594));x=(i%4)*300+(300-im.width)//2;y=(i//4)*650+10;contact.paste(im,(x,y));draw.text(((i%4)*300+12,y+605),f'{i+1:02} {s["label"]}',font=font,fill=INK)
contact.save(qa/'contact-sheet.jpg',quality=92)
doc=pdfium.PdfDocument(str(root/'luma-client-showcase.pdf'));sheet=Image.new('RGB',(900,math.ceil(len(doc)/3)*435),'#202719')
for i,page in enumerate(doc):
    im=page.render(scale=1.2).to_pil().convert('RGB');im.thumbnail((290,410));sheet.paste(im,((i%3)*300+5,(i//3)*435+5))
    if i in [0,9]:page.render(scale=1.5).to_pil().save(qa/f'pdf-page-{i+1}.png')
sheet.save(qa/'pdf-contact-sheet.jpg',quality=92)
print(f'Created and rendered {len(doc)} PDF pages')
