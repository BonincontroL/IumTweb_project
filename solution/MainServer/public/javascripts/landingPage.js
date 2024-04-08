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
}
