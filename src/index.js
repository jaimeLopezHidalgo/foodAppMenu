(function ($) {
    //GLOBAL VARIABLES
    const cardElement = "<div class=\"card\"><div class=\"imageCard\"><div class=\"quantityContainer\"><div><strong class=\"mealTag\"><\/strong><\/div><\/div><div class=\"gradientShadow\"><div class=\"mealArea\"><\/div><div class=\"mealName\"><\/div><\/div><\/div><div class=\"cardFooter\"><span class=\"iconContainer\"><i class=\"far fa-clock fa-lg\"><\/i><\/span><span><strong class=\"mealPrice\"><\/strong><\/span><\/div>" + "<\/div>";

    const mealsURL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef";

    const mealsLookupPrefix = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";


    //FUNCTIONS
    function loadMenu() {
        let menuContainer = $('#menuContainer');
        var card;
        var mealID;
        var mealImageURL;
        var mealName;
        var mealPrice;
        var mealIDs = [];

        menuContainer.empty();
        $.getJSON(mealsURL, function (mealsData) {
            $.each(mealsData.meals, function (ind, meal) {
                card = $(cardElement);
                mealName = meal.strMeal;
                mealImageURL = meal.strMealThumb;
                mealID = meal.idMeal;
                mealIDs.push(mealID);
                card.attr('id', mealID);
                mealPrice = mealID.substring(0, 2) + '.' + mealID.substring(2, mealID.length) + ',00 MXN';
                card.find('.imageCard').css("background-image", "url(" + mealImageURL + ")");
                card.find('.mealName').text(mealName);
                card.find('.mealPrice').text(mealPrice);
                menuContainer.append(card);
            });
        }).then(function () {
            var mealArea;
            var mealTag;
            var asyncCard;

            //dar credito al autor de flaticon 
            menuContainer.append($("<div>Icons made by <a href=\"https://www.flaticon.com/authors/kiranshastry\" title=\"Kiranshastry\">Kiranshastry<\/a> from <a href=\"https://www.flaticon.com/\" title=\"Flaticon\">www.flaticon.com</a><\/div>"));

            menuContainer.find('.card').each(function (i) {
                $.getJSON(mealsLookupPrefix+mealIDs[i], function (mealDetails) {
                    mealArea = mealDetails.meals[0].strArea;
                    mealTag = mealDetails.meals[0].strTags;
                    mealTag = mealTag==null? "": mealTag.split(',')[0];
                    cardAsync = menuContainer.find('#'+mealIDs[i]);
                    cardAsync.find('.mealArea').text(mealArea);
                    cardAsync.find('.mealTag').text(mealTag);
                })
            })
        });
    }    

    //MAIN CODE
    $(document).ready(function () {
        loadMenu();

        //JQUERY
        $('.circle').on('click', function () {
            if(!$(this).hasClass("selectedDay")){
                $(".selectedDay").toggleClass("selectedDay");
                $(this).toggleClass("selectedDay");
            }
        });

        $('#clickableLocation').on('click', function () {
            alert("alerta");
        });
        
        $('#plusOneIconButton').on('click', function () {
            alert("alerta");
        });
    });

})(jQuery);