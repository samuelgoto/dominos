'use strict';

var pizzapi = require('dominos');
var express = require('express');

var app = express();

var myStore = new pizzapi.Store({ID: 7931});

app.get('/', function (req, res) {
    myStore.getInfo(storeCallback.bind(myStore, function(store) {
        var html = "";

        html += "<link rel='import' href='//microforms.org/alpha/sdk.html'>";
        html += "";
        html += "<micro-resource title='Dominos' subtitle='1711 W El Camino Real, Mountain View, CA 94040'>";
        html += "";
        html += "  <micro-data>";
        html += JSON.stringify(store, undefined, ' ');
        html += "  </micro-data>";
        html += "  <micro-form method='GET' label='Order pizza!' action='/order'>";
        html += "    ";
        html += "    <micro-select name='pizza' label='Select a pizza'>";

        var toppings = {};
        for (var i in store.menu.toppings) {
          toppings[store.menu.toppings[i]["@id"]] = store.menu.toppings[i];
        }

        for (var i in store.menu.pizzas) {
          var pizza = store.menu.pizzas[i];
          // console.log(pizza);
        
          html += "    <micro-option label='" + pizza.name + "' value='" 
             + pizza["@id"] + "'>";
          html += "      <micro-select name='topping' label='Pick extra toppings'>"

          for (var j in pizza.availableToppings) {
            var topping = toppings[pizza.availableToppings[j]["@id"]];
            // console.log(toppings);
            // console.log(pizza.availableToppings[j]);
            html += "      <micro-option label='" + topping.name + "' value='" 
               + topping["@id"] + "'>";
            html += "      </micro-option>";
          }

          html += "      </micro-select>"
          html += "    </micro-option>";
        }

        html += "    </micro-select>";

        html += "    <micro-select name='quantity' label='How many pizzas would you like'>";
        html += "      <micro-option label='1' value='1' selected></micro-option>";
        html += "      <micro-option label='2' value='2'></micro-option>";
        html += "      <micro-option label='3' value='3'></micro-option>";
        html += "      <micro-option label='4' value='4'></micro-option>";
        html += "      <micro-option label='5' value='5'></micro-option>";
        html += "    </micro-select>";

        html += "    <micro-button label='Order'></micro-button>";
        html += "  </micro-form>";
        html += "</micro-resource>";
        
        res.send(html);
    }));
})

app.get("/order", function (req, res) {
    var order = req.query;
  
    var html = "";
    html += "<link rel='import' href='//microforms.org/alpha/sdk.html'>";
        html += "<micro-resource title='Dominos' subtitle='1711 W El Camino Real, Mountain View, CA 94040'>";
    html += "  <micro-data>";
    html += "  </micro-data>";
    html += "  <micro-form method='GET' label='Checkout' action='/checkout'>";
    html += "  <micro-header title='Your order' subtitle='Enter your delivery address so we can calculate your total order cost.'>";
    html += "  </micro-header>";
    html += "    <micro-input type='hidden' name='pizza' value='" + order.pizza + "'>";
    html += "    </micro-input>";
    html += "    <micro-input type='hidden' name='topping' value='" + order.topping + "'>";
    html += "    </micro-input>";
    html += "    <micro-input type='hidden' name='quantity' value='" + order.quantity + "'>";
    html += "    </micro-input>";
    html += "    <micro-section label='Personal information'>";
    html += "      <micro-input label='First name' name='firstname' value='Sam'>";
    html += "      </micro-input>";
    html += "      <micro-input label='Last name' name='lastname' value='Goto'>";
    html += "      </micro-input>";
    html += "      <micro-input label='Email' name='email' value='samuelgoto@gmail.com'>";
    html += "      </micro-input>";
    html += "      <micro-input label='Phone' name='phone' value='(650) 468 4542'>";
    html += "      </micro-input>";
    html += "    </micro-section>";
    html += "    <micro-section label='Delivery address'>";
    html += "      <micro-input label='Street' name='street' value='AMPHITHEATRE PKWY'>";
    html += "      </micro-input>";
    html += "      <micro-input label='Number' name='number' value='1600'>";
    html += "      </micro-input>";
    html += "      <micro-input label='City' name='city' value='Mountain View'>";
    html += "      </micro-input>";
    html += "      <micro-input label='State' name='state' value='CA'>";
    html += "      </micro-input>";
    html += "      <micro-input label='Zipcode' name='zip' value='94043-1351'>";
    html += "      </micro-input>";
    html += "    </micro-section>";
    html += "    <micro-button label='Checkout'></micro-button>";
    html += "  </micro-form>";
    html += "</micro-resource>";

    res.send(html);
});

function parseCustomer(query) {
    var customer = new pizzapi.Customer({
        firstName: query.firstname,
        lastName: query.lastname,
        address: {
            Street: query.number + " " + query.street,
            City: query.city,
            Region: query.state,
            PostalCode: query.zip,
            Type: "Business",
            StreetName: query.street,
            OrganizationName: "Google",
            StreetNumber: query.number,
        },
        email: query.email,
        phone: query.phone
    });
    return customer;
}

app.get("/checkout", function (req, res) {
    var query = req.query;
    var customer = parseCustomer(query);

    var order = new pizzapi.Order({
        customer: customer,
        storeID: myStore.ID,
        deliveryMethod: "Delivery"
    });

    order.addItem(new pizzapi.Item({
        code: "14SCREEN",
        options: [],
        quantity: 1
    }));

    // order.validate(function(response) {
    //    console.log(JSON.stringify(response, undefined, ' '));
    // });

    order.price(function(response) {
        var html = "";
        html += "<link rel='import' href='//microforms.org/alpha/sdk.html'>";
        html += "<micro-resource title='Dominos' subtitle='1711 W El Camino Real, Mountain View, CA 94040'>";
        html += "  <micro-data>";
        html += "  </micro-data>";
        html += "  <micro-form method='GET' label='Checkout' action='/confirm'>";
        html += "  <micro-header title='Your order' subtitle='Enter your credit card information to complete your order.'>";
        html += "  </micro-header>";

        // Choices
        html += "  <micro-input type='hidden' name='pizza' value='" + query.pizza + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='topping' value='" + query.topping + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='quantity' value='" + query.quantity + "'>";
        html += "  </micro-input>";

        // Personal information
        html += "  <micro-input type='hidden' name='firstname' value='" + query.firstname + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='lastname' value='" + query.lastname + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='email' value='" + query.email + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='phone' value='" + query.phone + "'>";
        html += "  </micro-input>";

        // Delivery address
        html += "  <micro-input type='hidden' name='street' value='" + query.street + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='number' value='" + query.number + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='state' value='" + query.state + "'>";
        html += "  </micro-input>";
        html += "  <micro-input type='hidden' name='zip' value='" + query.zip + "'>";
        html += "  </micro-input>";

        html += "    <micro-section label='Payment Information'>";
        html += "      <micro-input label='Credit card number' name='cc-number' value='4815821023390467'>";
        html += "      </micro-input>";
        html += "      <micro-input label='Expiration date' name='cc-exp' value='0719'>";
        html += "      </micro-input>";
        html += "      <micro-input label='Security code' name='cc-code' value='317'>";
        html += "      </micro-input>";
        html += "      <micro-input label='Billing zipcode' name='cc-zip' value='94085'>";
        html += "      </micro-input>";
        html += "    </micro-section>";
        
        html += "    <micro-button label='Checkout'></micro-button>";
        html += "  </micro-form>";
        html += "</micro-resource>";
        
        // console.log(JSON.stringify(response, undefined, ' '));
        res.send(html);
    });

    return;
});

app.get("/confirm", function (req, res) {
    var query = req.query;

    var customer = parseCustomer(query);

    var order = new pizzapi.Order({
        customer: customer,
        storeID: myStore.ID,
        deliveryMethod: "Delivery"
    });

    order.addItem(new pizzapi.Item({
        code: "14SCREEN",
        options: [],
        quantity: 1
    }));

    var cardNumber = query["cc-number"];

    var cardInfo = new order.PaymentObject();
    cardInfo.Amount = order.Amounts.Customer;
    cardInfo.Number = cardNumber;
    cardInfo.CardType = order.validateCC(cardNumber);
    cardInfo.Expiration = query["cc-exp"];
    cardInfo.SecurityCode = query["code"];
    cardInfo.PostalCode = query["zip"];

    order.Payments.push(cardInfo);

    var html = "";
    html += "<link rel='import' href='//microforms.org/alpha/sdk.html'>";
        html += "<micro-resource title='Dominos' subtitle='1711 W El Camino Real, Mountain View, CA 94040'>";
    html += "  <micro-data>";
    html += "  </micro-data>";
    html += "  <micro-form method='GET' label='Confirmed' action='/checkout'>";
    html += "    <micro-header title='Your order is confirmed!' subtitle='... actually we didnt place an order because, well, you know ... it costs money :)'>";
    html += "    </micro-header>";
    html += "    <micro-button type='close' label='Done'></micro-button>";
    html += "  </micro-form>";

    res.send(html);

    //order.place(function(result) {
    //    console.log("Order placed!");
    //    console.log(JSON.stringify(result, undefined, " "));
    //});
});

//pizzapi.Track.byId(myStore.ID, "793100417870", function(pizzaData){
//    console.log(pizzaData)
//});

//pizzapi.Track.byPhone("6504684542", function(pizzaData){
//    console.log(pizzaData);
//});


if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
  // [END server]
}

module.exports = app;

//var server = app.listen(8081, function () {

//  var host = server.address().address
//  var port = server.address().port

//  console.log("Example app listening at http://%s:%s", host, port);
//})

//pizzapi.Util.findNearbyStores(
//    '700 Clark Ave, St. Louis, MO, 63102',
//    'Delivery',
//    function(storeData){
//        console.log(storeData);
//    }
//);

//return;

// console.log("foo bar 2");

//myStore.getInfo(function(response) {
//  console.log(response);
//});

function storeCallback(callback, response){
    var result = response.result;

    if (!response.success) {
      // console.log(response);
      callback({});
      return;
    }

    var store = {
      "@context": "https://schemas.google.com/voice",
      "@type": "Restaurant",
      "@id": "https://dominos.com/stores/" + result.StoreID,
      sameAs: result.SocialReviewLinks["plus"],
      phone: result.Phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: result.StreetName,
        addressLocality: result.City,
        addressRegion: result.Region,
        postalCode: result.PostalCode,
        description: result.AddressDescription
      },
      openingHours: result.HoursDescription,

      deliveryHours: result.ServiceHoursDescription.Delivery,
      carryoutHours: result.ServiceHoursDescription.Carryout,
      paymentAccepted: result.AcceptablePaymentTypes.join(", ") + ", " +
                       result.AcceptableCreditCards.join(", "),

      estimatedWaitTime: result.EstimatedWaitMinutes + " mins",
      minimumDeliveryAmount: result.MinimumDeliveryOrderAmount,
      cashLimit: result.CashLimit,
    };

    //for (var attrname in store) {
    //  this[attrname] = store[attrname];
    //}
   
    this.getMenu(menuCallback.bind(this, store, callback));
}

function menuCallback(store, callback, response){
    // console.log(JSON.stringify(response.menuData, undefined, ' '));
    var toppings = [];
    for (var id in response.menuData.result.Toppings.Pizza) {
        var topping = response.menuData.result.Toppings.Pizza[id];
        toppings.push({
            "@id": "https://dominos.com/toppings/" + topping.Code,
            "@type": "Topping",
            name: topping.Name,
            description: topping.Description,
        });
    }
      
    // return; 
    // console.log();
    var pizzas = [];
    // var store = {};
    store.menu = { 
        toppings: toppings,
        pizzas: pizzas,
    };
    
    for (id in response.menuData.result.Products) {
        var product = response.menuData.result.Products[id];
        if (product.ProductType != "Pizza") {
            continue;
        }
        // if (product.Tags["NeedsCustomization"] == true) {
        //  continue;
        // }
        
        var availableToppings = [];
        product.AvailableToppings.split(",").forEach(function(topping) {
            // TODO(goto): figure out what the second parameter means
            availableToppings.push({
                "@id": "https://dominos.com/toppings/" + topping.split("=")[0]
            });
        });
        
        var defaultToppings = [];
        product.DefaultToppings.split(",").forEach(function(topping) {
            // TODO(goto): figure out what the second parameter means
            defaultToppings.push({
                "@id": "https://dominos.com/toppings/" + topping.split("=")[0]
            });
        });

        var pizza = {
            "@type": "Pizza",
            "@id": "https://dominos.com/pizzas/" + product.Code,
            name: product.Name,
            description: product.Description,
            defaultToppings: defaultToppings,
            availableToppings: availableToppings
        };
        
        pizzas.push(pizza);
        //console.log(product.Name);
        //console.log(product.Description);
        //console.log(product.DefaultToppings);
        //console.log(product.AvailableToppings);
        //console.log(product);
    }

    //for (var attrname in store) {
    //  this[attrname] = store[attrname];
    //}

    callback(store);
}
