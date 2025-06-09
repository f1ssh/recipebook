// Meal plan calendar and modal recipe picker
let recipes = [];
let recipeMap = {};
let current = new Date();
current.setDate(1);
let lastFocus = null;

function initCalendar(){
    recipes = getAllRecipes();
    recipeMap = Object.fromEntries(recipes.map(r => [r.id, r.name]));
    renderWeekdays();
    renderCalendar();
}

function renderWeekdays(){
    const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    document.querySelector('.weekdays').innerHTML = days.map(d=>`<div>${d}</div>`).join('');
}

function renderCalendar(){
    document.getElementById('cal-title').textContent = current.toLocaleString('default',{month:'long',year:'numeric'});
    const grid=document.getElementById('calendar-grid');
    grid.innerHTML='';
    const startDay=new Date(current.getFullYear(),current.getMonth(),1).getDay();
    for(let i=0;i<startDay;i++) grid.appendChild(document.createElement('div'));
    const daysInMonth=new Date(current.getFullYear(),current.getMonth()+1,0).getDate();
    const plan=getMealPlan();
    for(let d=1; d<=daysInMonth; d++){
        const date=new Date(current.getFullYear(),current.getMonth(),d);
        const iso=date.toISOString().split('T')[0];
        const cell=document.createElement('div');
        cell.className='day';
        cell.tabIndex=0;
        cell.dataset.date=iso;
        cell.innerHTML=`<div class='day-num'>${d}</div>`;
        const list=document.createElement('ul');
        list.className='meal-list';
        (plan[iso]||[]).forEach(id=>{
            const li=document.createElement('li');
            li.textContent=recipeMap[id]||'Unknown';
            list.appendChild(li);
        });
        cell.appendChild(list);
        cell.addEventListener('click',ev=>{ev.stopPropagation();openRecipeModal(iso,cell);});
        cell.addEventListener('keydown',ev=>{if(ev.key==='Enter') openRecipeModal(iso,cell);});
        grid.appendChild(cell);
    }
    const remainder=(7-grid.children.length%7)%7;
    for(let i=0;i<remainder;i++) grid.appendChild(document.createElement('div'));
}

function filterRecipes(){
    const q=document.getElementById('modal-search').value.toLowerCase();
    const cat=document.getElementById('modal-cat').value;
    const fav=document.getElementById('modal-fav').checked;
    return recipes.filter(r=>{
        if(q && !r.name.toLowerCase().includes(q)) return false;
        if(cat && (r.category||'')!==cat) return false;
        if(fav && !r.favorite) return false;
        return true;
    });
}

function buildRecipeList(date){
    const listEl=document.querySelector('.recipe-list');
    listEl.innerHTML='';
    filterRecipes().forEach(r=>{
        const item=document.createElement('div');
        item.className='recipe-item';
        const img=r.photo?`<img src="${r.photo}" alt="">`:'<div style="width:50px;height:50px"></div>';
        item.innerHTML=`${img}<span class="name">${r.name}</span><span>${r.category||''}</span>`;
        const btn=document.createElement('button');
        btn.textContent='Add';
        btn.addEventListener('click',()=>{
            const plan=getMealPlan();
            const arr=plan[date]||[];
            arr.push(r.id);
            plan[date]=arr; saveMealPlan(plan); renderCalendar();
            updateScheduled(date);
        });
        item.appendChild(btn);
        listEl.appendChild(item);
    });
}

function updateScheduled(date){
    const wrapper=document.querySelector('.scheduled');
    const plan=getMealPlan();
    const arr=plan[date]||[];
    wrapper.innerHTML='';
    if(!arr.length) return;
    const title=document.createElement('div');
    title.textContent=`Scheduled for ${date}`;
    wrapper.appendChild(title);
    arr.forEach(id=>{
        const chip=document.createElement('span');
        chip.className='sched-chip';
        chip.textContent=recipeMap[id]||'Unknown';
        const x=document.createElement('button');
        x.textContent='✕';
        x.addEventListener('click',()=>{
            const plan2=getMealPlan();
            plan2[date]=plan2[date].filter(rid=>rid!==id);
            saveMealPlan(plan2); renderCalendar(); updateScheduled(date);
        });
        chip.appendChild(x);
        wrapper.appendChild(chip);
    });
}

function trapFocus(modal){
    const focusable=modal.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
    if(!focusable.length) return;
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    modal.addEventListener('keydown',function(e){
        if(e.key==='Tab'){
            if(e.shiftKey){
                if(document.activeElement===first){ e.preventDefault(); last.focus(); }
            }else{
                if(document.activeElement===last){ e.preventDefault(); first.focus(); }
            }
        }else if(e.key==='Escape') closeRecipeModal();
    });
}

function openRecipeModal(date, cell){
    lastFocus=cell;
    const modal=document.getElementById('recipe-modal');
    modal.classList.remove('hidden');
    modal.classList.add('show');
    modal.innerHTML=`<div class="modal-content"><div class="modal-header"><h3>Select Recipes</h3><button class="modal-close" aria-label="Close">✕</button></div><div class="scheduled"></div><div class="filter-bar"><input type="text" id="modal-search" placeholder="Search"><select id="modal-cat"><option value="">All</option>${getCategories().map(c=>`<option>${c}</option>`).join('')}</select><label><input type="checkbox" id="modal-fav"> ★ Favorites only</label></div><div class="recipe-list"></div></div>`;
    modal.querySelector('.modal-close').addEventListener('click',closeRecipeModal);
    modal.addEventListener('click',e=>{ if(e.target===modal) closeRecipeModal(); });
    document.getElementById('modal-search').addEventListener('input',()=>buildRecipeList(date));
    document.getElementById('modal-cat').addEventListener('change',()=>buildRecipeList(date));
    document.getElementById('modal-fav').addEventListener('change',()=>buildRecipeList(date));
    updateScheduled(date);
    buildRecipeList(date);
    trapFocus(modal);
    setTimeout(()=>modal.querySelector('#modal-search').focus(),0);
}

function closeRecipeModal(){
    const modal=document.getElementById('recipe-modal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    modal.innerHTML='';
    if(lastFocus){ lastFocus.focus(); lastFocus=null; }
}

document.getElementById('prev-month').addEventListener('click',()=>{current.setMonth(current.getMonth()-1);renderCalendar();});
document.getElementById('next-month').addEventListener('click',()=>{current.setMonth(current.getMonth()+1);renderCalendar();});
document.getElementById('today-btn').addEventListener('click',()=>{current=new Date();current.setDate(1);renderCalendar();});

initCalendar();

