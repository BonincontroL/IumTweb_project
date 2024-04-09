function init(){
    let swiper= new Swiper(".competition-swiper",{
        slidesPerView:1,
        direction:"horizontal",
        spaceBetween:30,
        loop:true,
        pagination:{
            el:".swiper-pagination",
            clickable:true
        },
        navigation:{
            nextEl:".swiper-button-next",
            prevEl:".swiper-button-prev"
        }
    })

    let competition_cards = document.querySelectorAll('.competition-card')
    competition_cards.forEach(card=>{
        card.addEventListener('click',()=>{
            let competition_id = card.getAttribute('data-competitionId')
            window.location.href="../competition_page.html?competition_id="+competition_id
        })
    })
}
