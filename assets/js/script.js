const canvas=document.getElementById('bg');
const ctx=canvas.getContext('2d');

let w,h;
function resize(){
w=canvas.width=window.innerWidth;
h=canvas.height=window.innerHeight;
}
window.addEventListener('resize',resize);
resize();

const total=120;
const frames=[];

for(let i=0;i<total;i++){
const img=new Image();
img.src=`assets/frames/frame-${String(i).padStart(4,'0')}.jpg`;
frames.push(img);
}

function draw(i){
const img=frames[i];
if(!img||!img.complete)return;

const scale=Math.max(w/img.width,h/img.height);
const x=(w-img.width*scale)/2;
const y=(h-img.height*scale)/2;

ctx.clearRect(0,0,w,h);
ctx.drawImage(img,x,y,img.width*scale,img.height*scale);
}

window.addEventListener('scroll',()=>{
const max=document.body.scrollHeight-window.innerHeight;
const p=window.scrollY/max;
draw(Math.floor(p*total));
});

const els=document.querySelectorAll('.reveal');
window.addEventListener('scroll',()=>{
els.forEach(el=>{
if(el.getBoundingClientRect().top<window.innerHeight*0.85){
el.classList.add('active');
}
});
});
