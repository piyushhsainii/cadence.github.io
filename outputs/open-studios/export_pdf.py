from pathlib import Path
import json, math
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit

root=Path(__file__).parent
qa=root/'qa'
data=json.loads((qa/'screen-data.json').read_text())
font_path=Path('C:/Windows/Fonts/arial.ttf')
bold_path=Path('C:/Windows/Fonts/arialbd.ttf')
pdfmetrics.registerFont(TTFont('Studio',str(font_path)))
pdfmetrics.registerFont(TTFont('StudioBold',str(bold_path)))
font=ImageFont.truetype(str(font_path),18)
sheet=Image.new('RGB',(1200,math.ceil(len(data)/4)*650),'#eae8e2')
draw=ImageDraw.Draw(sheet)
for i,s in enumerate(data):
    im=Image.open(qa/(s['id']+'.png')).convert('RGB')
    im.thumbnail((280,594))
    x=(i%4)*300+(300-im.width)//2;y=(i//4)*650+10
    sheet.paste(im,(x,y));draw.text(((i%4)*300+12,y+605),f'{i+1:02} {s["label"]}',font=font,fill='#171817')
sheet.save(qa/'contact-sheet.jpg',quality=92)

W,H=595.276,841.89
c=canvas.Canvas(str(root/'open-studios-client-showcase.pdf'),pagesize=(W,H))
c.setTitle('Open Studios - Mobile Experience Concept')
c.setAuthor('Open Studios / Client Concept')
c.setSubject('17 mobile app screens, design rationale, and interactive prototype companion')
BG='#F6F4EF';INK='#171817';MUTED='#676660';SAGE='#416B5B';CORAL='#F36F4C'
def text(s,x,y,size=12,color=INK,bold=False):
    c.setFont('StudioBold' if bold else 'Studio',size);c.setFillColor(HexColor(color));c.drawString(x,y,s)
def para(s,x,y,width=235,size=9,color=MUTED,leading=None,bold=False):
    leading=leading or size*1.5
    for line in simpleSplit(s,'StudioBold' if bold else 'Studio',size,width):
        text(line,x,y,size,color,bold);y-=leading
    return y
def rect(x,y,w,h,col):
    c.setFillColor(HexColor(col));c.rect(x,y,w,h,fill=1,stroke=0)
def footer(num,dark=False):
    col='#ADB8AF' if dark else MUTED
    text('OPEN STUDIOS / MOBILE EXPERIENCE CONCEPT',36,25,7,col)
    text(f'{num:02}',W-50,25,8,col)
def phone(id,x,y,w=239):
    im=Image.open(qa/(id+'.png'))
    c.saveState()
    p=c.beginPath();p.roundRect(x,y,w,w*im.height/im.width,w*48/406)
    c.clipPath(p,stroke=0,fill=0)
    c.drawImage(ImageReader(im),x,y,width=w,height=w*im.height/im.width,mask='auto')
    c.restoreState()

# Cover: a concise presentation brief and two phone mockups.
rect(0,0,W,H,'#202C28')
text('OPEN STUDIOS',38,793,12,'#F6F4EF',True)
text('PRODUCT CONCEPT / 2026',W-186,793,8,'#B9CDBC')
text('A city worth',36,718,44,'#F6F4EF',True)
text('getting lost in.',36,667,44,'#C5D2BD',True)
para('A curated cultural guide connecting artists, studios, and the people who are curious enough to step inside.',38,622,425,12,'#C4CDC4',18)
phone('explore',49,97,224)
phone('map',316,97,224)
text('17 screens. One inspiring weekend.',38,65,12,'#F6F4EF',True)
text('Interactive companion: open-studios-showcase.html',38,45,8,'#C4CDC4')
footer(1,True);c.showPage()

group_titles=['Welcome to the creative city','Find a place worth visiting','Discover the people behind the work','A closer look at craft','From inspiration to itinerary','A route shaped around you','A weekend full of possibility','The community around the art','A considered organizer workflow']
for group,start in enumerate(range(0,len(data),2)):
    rect(0,0,W,H,BG)
    text('OPEN STUDIOS',36,H-34,9,INK,True)
    text('SCREEN COLLECTION',W-157,H-34,8,MUTED)
    text(group_titles[group],36,H-77,23,INK,True)
    para('Editorial clarity, familiar controls, and a clear next step.',36,H-100,500,10,MUTED)
    pair=data[start:start+2]
    for j,s in enumerate(pair):
        x=36+j*271
        phone(s['id'],x+5,193,242)
        text(f'{start+j+1:02}  {s["label"]}',x,169,11,INK,True)
        para(s['description'],x,146,242,9,MUTED,13)
    if len(pair)==1:
        x=307
        text('The interaction flow',x,682,18,INK,True)
        for k,(label,desc) in enumerate([('01  Upload','Choose a CSV file or use the sample data.'),('02  Mapping','Match artist, medium, studio, and region columns.'),('03  Validation','Review missing values before continuing.'),('04  Preview','Check the first records and confirm the dataset.'),('05  Publish','Complete the local demo with a success state.')]):
            y=632-k*80;text(label,x,y,12,SAGE,True);para(desc,x,y-21,230,10,MUTED,15)
        para('Files remain on the device. Publishing is simulated; no live data is changed.',x,205,235,9,MUTED,14)
    rect(36,67,W-72,1,'#DEDCD4')
    para('Interactive version: open-studios-showcase.html. Artwork, artists, locations, dates, and partner identities are illustrative concept content.',36,52,W-72,7,MUTED,10)
    footer(group+2);c.showPage()
c.save()

# Render every PDF page for final layout review.
try:
    import pypdfium2 as pdfium
    doc=pdfium.PdfDocument(str(root/'open-studios-client-showcase.pdf'))
    pdf_sheet=Image.new('RGB',(900,math.ceil(len(doc)/3)*435),'#e7e5df')
    for i,page in enumerate(doc):
        im=page.render(scale=1.2).to_pil().convert('RGB')
        im.thumbnail((290,410))
        pdf_sheet.paste(im,((i%3)*300+5,(i//3)*435+5))
        if i in [0,1,9]:page.render(scale=1.5).to_pil().save(qa/f'pdf-page-{i+1}.png')
    pdf_sheet.save(qa/'pdf-contact-sheet.jpg',quality=92)
    print(f'PDF: {len(doc)} pages, rendered and ready for inspection')
except ImportError:
    print('PDF created; PDFium is unavailable for rendering')
