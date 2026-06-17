
const canvas=document.getElementById('bg');
const ctx=canvas.getContext('2d');

let w,h;
function resize(){
w=canvas.width=innerWidth;
h=canvas.height=innerHeight;
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
const max=document.body.scrollHeight-innerHeight;
const p=window.scrollY/max;
draw(Math.floor(p*total));
});

const els=document.querySelectorAll('.reveal');
window.addEventListener('scroll',()=>{
els.forEach(e=>{
if(e.getBoundingClientRect().top<innerHeight*0.85){
e.classList.add('active');
}
});
});
