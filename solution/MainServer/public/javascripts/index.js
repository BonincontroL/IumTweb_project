//questo JS è per le funzioni comuni
function manageLateralButtons(lateralButtons){
    lateralButtons.forEach(btn=>{
        btn.addEventListener('click',function (){
            lateralButtons.forEach(button=>{
                button.classList.remove('active')
                let btnLogo=button.querySelector('img')
                let btnLogoNewSrc =btnLogo.src.replace("Active","")
                btnLogo.setAttribute('src',btnLogoNewSrc)
            })
            this.classList.add('active')
            let btnLogo = this.querySelector('img')
            let btnLogoSrc= btnLogo.getAttribute('src').split('.')[0]
            btnLogoSrc+='Active.svg'
            btnLogo.setAttribute('src',btnLogoSrc)
        })
    })
}

function hideAllMainContainers(pageName){
    const mainContainers=document.querySelectorAll(`#${pageName} .main-container`)
    mainContainers.forEach(container=>{container.style.display="none"})
}