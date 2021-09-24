(function ($) {
    //GLOBAL VARIABLES
    const cardElement = "<div class=\"card mealCard\"><div class=\"imageCard\"><div class=\"quantityContainer\"><div><strong class=\"mealTag\"><\/strong><\/div><\/div><div class=\"gradientShadow\"><div class=\"mealArea\"><\/div><div class=\"mealName\"><\/div><\/div><\/div><div class=\"cardFooter\"><span class=\"iconContainer\"><i class=\"far fa-clock fa-lg\"><\/i><\/span><span><strong class=\"mealPrice\"><\/strong><\/span><\/div>" + "<\/div>";

    const modalButtonElement = "<div class=\"myButton modalButton\"><\/div>";

    const mealsURL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef";

    const mealsLookupPrefix = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

    const categoriesURL = "https://www.themealdb.com/api/json/v1/1/categories.php";

    var mealsJSON;
    var alertTimeout;

    //FUNCTIONS

    function loadJSONInfo() {
        //Hacer 3 llamadas (requests) asíncronas a los APIs
        $.getJSON(mealsURL, function (mealsData) {
            //primer request:

            mealsJSON = mealsData.meals; //guardar JSON con todos los platillos
        }).then(function () {//'then' espera a que termine el request anterior
            mealsJSON.forEach((meal, i) => {
                $.getJSON(mealsLookupPrefix + meal.idMeal, function (mealLookup) {
                    //segundo request: 

                    //Actualizar cada platillo en JSON con los datos de categoría y área
                    mealArea = mealLookup.meals[0].strArea;
                    mealsJSON[i].strArea = mealArea;
                    var mealTag = mealLookup.meals[0].strTags;
                    mealTag = mealTag == null ? "" : mealTag.split(',')[0];
                    mealsJSON[i].strTags = mealTag;
                })
            });
        }).then(function () {
            $.getJSON(categoriesURL, function (categoriesData) {
                //tercer request: 

                var category;
                var modalBody = $('#servicesModal');
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
        });
    }

    function reloadMenu() {
        let menuContainer = $('#menuContainer');
        var card;
        var mealID;
        var mealImageURL;
        var mealName;
        var mealPrice;

        menuContainer.empty(); //vaciar menú actual
        mealsJSON.forEach((meal, i) => {
            card = $(cardElement); //nueva tarjeta

            //recolectar datos de los JSON guardados
            mealID = meal.idMeal;
            mealImageURL = meal.strMealThumb;
            mealTag = meal.strTags;
            mealTag = mealTag == null ? "" : mealTag.split(',')[0];
            mealArea = meal.strArea;
            mealName = meal.strMeal;
            mealPrice = mealID.substring(0, 2) + '.' + mealID.substring(2, mealID.length) + ',00 MXN';

            //llenar tarjeta
            card.find('.imageCard').css("background-image", "url(" + mealImageURL + ")");
            card.find('.mealTag').text(mealTag);
            card.find('.mealArea').text(mealArea);
            card.find('.mealName').text(mealName);
            card.find('.mealPrice').text(mealPrice);

            menuContainer.append(card); //meter tarjeta al cuerpo del menú
        });

    }

    function loadHomePage(){
        loadJSONInfo(); //guardar info de los APIs localmente
        setTimeout(function () {
            reloadMenu(); //esperar a qué terminen los requests y cargar menú
        }, 1000);
    }

    function filterMenu(category) {
        var imageCards = $("#menuContainer").find(".imageCard");
        var mealTag;
        var remainingCards = imageCards.length;

        $('#filterMessage').css("visibility", "hidden"); //siempre esconder el mensaje de 0 resultados

        if (remainingCards < mealsJSON.length) { //si el menú se encuentra filtrado
            reloadMenu();
            imageCards = $("#menuContainer").find(".imageCard");
            remainingCards = imageCards.length;
        }

        imageCards.each(function () {
            mealTag = $(this).find(".mealTag").text();
            if (mealTag != category) {
                $(this).closest(".card").remove(); //los platillos fuera del criterio
                remainingCards -= 1;
            }
        })

        if (remainingCards == 0) {
            //si no hubo resultados:
            $('#filterMessage').css("visibility", "visible"); //mostrar mensaje de filtrado
        } else {
            $('#filterMessage').css("visibility", "hidden"); //Esconder mensaje de filtrado
        }

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
                    filterMenu(text); //filtrar menú por categoría
                }
            }
            $('#modalBlur').fadeOut(); //esconder pop-up
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

        $('.fa-times').on('click', function () {
            //al hacer click en la 'x' de alerta:

            $('#alertCard').hide(); //esconder alerta
        })
    });

})(jQuery);