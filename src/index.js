(function ($) {
    //GLOBAL VARIABLES
    const cardElement = "<div class=\"card mealCard\"><div class=\"imageCard\"><div class=\"quantityContainer\"><div><strong class=\"mealTag\"><\/strong><\/div><\/div><div class=\"gradientShadow\"><div class=\"mealArea\"><\/div><div class=\"mealName\"><\/div><\/div><\/div><div class=\"cardFooter\"><span class=\"iconContainer\"><i class=\"far fa-clock fa-lg\"><\/i><\/span><span><strong class=\"mealPrice\"><\/strong><\/span><\/div>" + "<\/div>";

    const modalButtonElement = "<div class=\"myButton modalButton\"><\/div>";

    const mealsURLPrefix = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";

    const mealsLookupPrefix = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

    const categoriesURL = "https://www.themealdb.com/api/json/v1/1/categories.php";

    var alertTimeout;

    //FUNCTIONS
    function getNewCard(imageURL, tag, area, name, price) {
        var card = $(cardElement); //nueva tarjeta

        //llenar tarjeta
        card.find('.imageCard').css("background-image", "url(" + imageURL + ")");
        card.find('.mealTag').text(tag);
        card.find('.mealArea').text(area);
        card.find('.mealName').text(name);
        card.find('.mealPrice').text(price);

        return card;
    }

    async function getInitialMealData(mealJSON) {
        //función asíncrona que extrae los datos iniciales de los platillos
        
        //objeto a llenar:
        var summary = {
            mealID:"",
            mealPrice:"",
            mealName:"",
            mealImageURL:""
        };

        //llenar objeto local a partir de 'mealJSON': 
        summary.mealID = mealJSON.idMeal;
        summary.mealPrice = summary.mealID.substring(0, 2) + '.' + summary.mealID.substring(2, summary.mealID.length) + ',00 MXN';
        summary.mealName = mealJSON.strMeal;
        summary.mealImageURL = mealJSON.strMealThumb;

        return summary;
    }

    function fetchCategory(category) {
        let menuContainer = $('#menuContainer');
        menuContainer.empty(); //vaciar menú actual
        var mealTag;
        var mealArea;
        var card;

        //request del API por categoría:
        $.getJSON(mealsURLPrefix + category, function (mealsData) {

            //por cada platillo:
            $.each(mealsData.meals, function (key, mealJSON) {
                getInitialMealData(mealJSON) //función asíncrona para obtener datos necesarios ANTES de la siguiente parte:
                .then(function (initialInfo) {
                    
                    //request del API de los detalles de dicho platillo:
                    $.getJSON(mealsLookupPrefix + initialInfo.mealID, function (mealDetailsData) {
                        mealTag = mealDetailsData.meals[0].strTags;
                        mealTag = mealTag == null ? "" : mealTag.split(',')[0];
                        mealArea = mealDetailsData.meals[0].strArea;
                        card = getNewCard(initialInfo.mealImageURL, mealTag, mealArea, initialInfo.mealName, initialInfo.mealPrice);
                        menuContainer.append(card); //meter tarjeta al cuerpo del menú
                    });
                });
            });
        });
    }

    function loadCategoriesModal() {
        //request al API de categorías:
        $.getJSON(categoriesURL, function (categoriesData) {
            var modalBody = $('#servicesModal');
            var category;
            var button;

            //para cada categoría:
            $.each(categoriesData.categories, function (i, data) {
                category = data.strCategory;
                button = $(modalButtonElement);
                if (category == "Beef") {
                    button.addClass("modalButtonSelected");
                }
                button.text(category);
                modalBody.append(button); //guardar categorías de filtrado en cuerpo del pop-up de categoría
            });
        })
    }

    function loadHomePage() {
        loadCategoriesModal();
        fetchCategory("Beef");
    }

    function toggleModal() {
        //desplegar o esconder pop-up:
        if ($('#modalBlur').prop("hidden")) {
            //desplegar pop-up:

            $('#modalBlur').fadeIn();
            $('#modalBlur').prop("hidden", false);
            $('#mainContentContainer').css("overflow-y", "hidden"); //desactivar el scroll del menú
        } else {
            //desplegar pop-up:

            $('#modalBlur').fadeOut();
            $('#modalBlur').prop("hidden", true);
            $('#mainContentContainer').css("overflow-y", "auto"); //activar el scroll del menú
        }
    }

    function displayAlert() {
        //mostrar alerta:

        clearTimeout(alertTimeout);
        $('#alertCard').fadeIn();
        alertTimeout = setTimeout(function () {
            $('#alertCard').fadeOut(); //borrarla después de 4 segundos
        }, 4000);
    }

    //MAIN CODE
    $(document).ready(function () {
        loadHomePage();

        //JQUERY
        $('.circle').on('click', function () {
            //cambiar el color del día seleccionado
            if (!$(this).hasClass("selectedDay")) {
                $(".selectedDay").toggleClass("selectedDay");
                $(this).toggleClass("selectedDay");
            }
        });

        $('#clickableLocation').on('click', function () {
            displayAlert();
        });

        $('#plusOneChip').on('click', function () {
            displayAlert();
        });

        $('.modal').on('click', '.modalButton', function () {
            //al hacer click en un botón del pop-up

            var text;
            if (!$(this).hasClass("modalButtonSelected")) {
                //sombrear el botón del pop-up seleccionado:

                $(".modalButtonSelected").toggleClass("modalButtonSelected");
                $(this).toggleClass("modalButtonSelected");
                text = $(this).text(); //extraer el valor del botón
                if ($(this).closest(".modal").attr('id') == "hourModal") {
                    //si el botón pertenece al pop-up de horarios:

                    $('#timeChip').find(".chipDescription").text(text); //asignar valor seleccionado
                } else {
                    //si el botón pertenece al pop-up de categorías:

                    $('#servicesChip').find(".chipDescription").text(text); //asignar valor seleccionado
                    fetchCategory(text); //filtrar menú por categoría
                }
            }
            toggleModal() //esconder pop-up
        });

        $('.chip').on('click', function () {
            //al hacer click en chips:

            var id = $(this).attr('id');

            if (id != "plusOneChip") {
                toggleModal(); //desplegar pop-up
                if (id == "timeChip") {
                    //si fue el chip de horarios:

                    //llenar contenido del pop-up con horarios:
                    $('#servicesModal').fadeOut(0);
                    $('#hourModal').fadeIn(0);
                } else {
                    //si fue el chip de categorías:

                    //llenar contenido del pop-up con categorías:
                    $('#hourModal').fadeOut(0);
                    $('#servicesModal').fadeIn(0);
                }
            }
        });

        $('#modalBlur').on('click',function (){
            toggleModal();
        });

        $('.modal').on('click',function (e){
            e.stopPropagation();
        });

        $('.fa-times').on('click', function () {
            //al hacer click en la 'x' de alerta:

            $('#alertCard').hide(); //esconder alerta
        })
    });

})(jQuery);