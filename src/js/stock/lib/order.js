
exports.listOrders = function(accountId,successCallback,errorCallback)
{
    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-ListOrders
    //
    
    var validationResult = this._validateAsString(accountId);
    if (!validationResult.valid)
        return errorCallback("The accountId parameter is invalid");
    
    var actionDescriptor = {
            method : "GET",
            module : "order",
            action : "orderlist/" + validationResult.value,
            useJSON: true,
    };
    
    this._run(actionDescriptor,{},successCallback,errorCallback);
};

exports.previewEquityOrder = function(params,successCallback,errorCallback)
{
    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-PreviewEquityOrder
    //
    // accountId          integer required    Numeric account ID
    // symbol             string  required    The market symbol for the security being bought or sold
    // orderAction        enum    required    The action that the broker is requested to perform. Possible values are:
    //                                             • BUY
    //                                             • SELL
    //                                             • BUY_TO_COVER
    //                                             • SELL_SHORT
    // clientOrderId      string  required    A reference number generated by the developer. Used to ensure that a duplicate order is not being submitted. It can be any value of 20 alphanumeric characters or less, but must be unique within this account. It does not appear in any API responses.
    // priceType          enum    required    The type of pricing. Possible values are:
    //                                             • MARKET
    //                                             • LIMIT
    //                                             • STOP
    //                                             • STOP_LIMIT
    //                                             • MARKET_ON_CLOSE
    //                                          If STOP, requires a stopPrice. If LIMIT, requires a limitPrice. If STOP_LIMIT equity order, requires both.
    // limitPrice         double  conditional The highest price at which to buy or the lowest price at which to sell if specified in a limit order. Required if priceType is LIMIT or STOP_LIMIT.
    // stopPrice          double  conditional The price at which to buy or sell if specified in a stop order. Required if priceType is STOP or STOP_LIMIT.
    // allOrNone          boolean optional    If TRUE, the transactions specified in the order must be executed all at once, or not at all. Default is FALSE.
    // quantity           integer required    The number of shares to buy or sell
    // reserveOrder       boolean optional    If set to TRUE, publicly displays only a limited number of shares (the reserve quantity), instead of the entire order, to avoid influencing other traders. Default is FALSE. If TRUE, must also specify the reserveQuantity.
    // reserveQuantity    integer conditional The number of shares to be publicly displayed if this is a reserve order. Required if reserveOrder is TRUE.
    // marketSession      enum    required    Session in which the equity order will be placed. Possible values are: REGULAR, EXTENDED.
    // orderTerm          enum    required    Specifies the term for which the order is in effect. Possible values are:
    //                                              • GOOD_UNTIL_CANCEL
    //                                              • GOOD_FOR_DAY
    //                                              • IMMEDIATE_OR_CANCEL (only for limit orders)
    //                                              • FILL_OR_KILL (only for limit orders)
    // routingDestination enum    optional    The exchange where the order should be executed. Users may want to specify this if they believe they can get a better order fill at a specific exchange, rather than relying on the automatic order routing system. Possible values are:
    //                                              • AUTO (default)
    //                                              • ARCA
    //                                              • NSDQ
    //                                              • NYSE

    
    if (!this.previewEquityOrderDescriptors)
    {
        var priceTypeIsStop = function(p) { return p.priceType == "STOP"; };
        var priceTypeIsStopLimit = function(p) { return p.priceType == "STOP_LIMIT"; };
        var priceTypeIsLimit = function(p) { return p.priceType == "LIMIT"; };
        
        this.previewEquityOrderDescriptors = this._buildParamsDescriptor([
            "accountId", true, this._validateAsInt.bind(this),
            "symbol",true, this._validateAsString.bind(this),
            "orderAction",true,this._validateAsOneOf(["BUY","SELL","BUY_TO_COVER","SELL_SHORT"]),
            "clientOrderId",true,this._validateAsString.bind(this),
            "priceType",true,this._validateAsOneOf(["MARKET","LIMIT","STOP","STOP_LIMIT","MARKET_ON_CLOSE"]),
            "limitPrice",function(p) { return priceTypeIsLimit(p) || priceTypeIsStopLimit(p); },this._validateAsFloat.bind(this),
            "stopPrice",function(p) { return priceTypeIsStop(p) || priceTypeIsStopLimit(p); }, this._validateAsFloat.bind(this),
            "allOrNone",false,this._validateAsBool.bind(this),
            "quantity",true,this._validateAsInt.bind(this),
            "reserveOrder",false,this._validateAsBool.bind(this),
            "reserveQuantity",function(p) { return p.reserveOrder; },this._validateAsInt.bind(this),
            "marketSession",true,this._validateAsOneOf(["REGULAR","EXTENDED"]),
            "orderTerm",true,this._validateAsOneOf(["GOOD_UNTIL_CANCEL","GOOD_FOR_DAY","IMMEDIATE_OR_CANCEL","FILL_OR_KILL"]),
            "routingDestination",false,this._validateAsOneOf(["AUTO","ARCA","NSDQ","NYSE"]),
        ]);
    }
    
    var validationResult = this._validateParams(this.previewEquityOrderDescriptors,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "previewequityorder",
            useJSON: true,
    };

    var wrappedParams = { PreviewEquityOrder : { "-xmlns": "http://order.etws.etrade.com", EquityOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports.placeEquityOrder = function(params,successCallback,errorCallback)
{
    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-PlaceEquityOrder
    //
    // accountId          integer required    Numeric account ID
    // symbol             string  required    The market symbol for the security being bought or sold
    // orderAction        enum    required    The action that the broker is requested to perform. Possible values are:
    //                                              • BUY
    //                                              • SELL
    //                                              • BUY_TO_COVER
    //                                              • SELL_SHORT
    // previewId          long    conditional If the order was not previewed, this parameter should not be specified. If the order was previewed, this parameter must specify the numeric preview ID from the preview, and other parameters of this request must match the parameters of the preview.
    // clientOrderId      string  required    A reference number generated by the developer. Used to ensure that a duplicate order is not being submitted. It can be any value of 20 alphanumeric characters or less, but must be unique within this account. It does not appear in any API responses.
    // priceType          enum    required    The type of pricing specified in the equity order. Possible values are:
    //                                              • MARKET
    //                                              • LIMIT
    //                                              • STOP
    //                                              • STOP_LIMIT
    //                                              • MARKET_ON_CLOSE
    //                                        If STOP, requires a stopPrice. If LIMIT, requires a limitPrice. If STOP_LIMIT, requires both.
    //                                        For more information on these values, refer to the E*TRADE online help on conditional orders.
    // limitPrice         double  conditional The highest price at which to buy or the lowest price at which to sell. Required if priceType is LIMIT or STOP_LIMIT.
    // stopPrice          double  conditional The price at which to buy or sell if specified in a stop order. Required if priceType is STOP or STOP_LIMIT.
    // allOrNone          boolean optional    If TRUE, the transactions specified in the order must be executed all at once, or not at all. Default is FALSE.
    // quantity           integer required    The number of shares to buy or sell
    // reserveOrder       boolean optional    If set to TRUE, publicly displays only a limited number of shares (the reserve quantity), instead of the entire order, to avoid influencing other traders. Default is FALSE. If TRUE, must also specify the reserveQuantity.
    // reserveQuantity    integer conditional The number of shares to be publicly displayed if this is a reserve order. Required if reserveOrder is TRUE.
    // marketSession      enum    required    Session in which the equity order will be placed. Possible values are: REGULAR, EXTENDED.
    // orderTerm          enum    required    Specifies the term for which the order is in effect. Possible values are:
    //                                              • GOOD_UNTIL_CANCEL
    //                                              • GOOD_FOR_DAY
    //                                              • IMMEDIATE_OR_CANCEL (only for limit orders)
    //                                              • FILL_OR_KILL (only for limit orders)
    // routingDestination enum    optional    The exchange where the order should be executed. Users may want to specify this if they believe they can get a better order fill at a specific exchange, rather than relying on the automatic order routing system. Possible values are:
    //                                              • AUTO (default)
    //                                              • ARCA
    //                                              • NSDQ
    //                                              • NYSE

    
    if (!this.placeEquityOrderDescriptors)
    {
        var priceTypeIsStop = function(p) { return p.priceType == "STOP"; };
        var priceTypeIsStopLimit = function(p) { return p.priceType == "STOP_LIMIT"; };
        var priceTypeIsLimit = function(p) { return p.priceType == "LIMIT"; };
        
        this.placeEquityOrderDescriptors = this._buildParamsDescriptor([
            "accountId", true, this._validateAsInt.bind(this),
            "symbol",true, this._validateAsString.bind(this),
            "orderAction",true,this._validateAsOneOf(["BUY","SELL","BUY_TO_COVER","SELL_SHORT"]),
            "previewId",false,this._validateAsInt.bind(this), 
            "clientOrderId",true,this._validateAsString.bind(this),
            "priceType",true,this._validateAsOneOf(["MARKET","LIMIT","STOP","STOP_LIMIT","MARKET_ON_CLOSE"]),
            "limitPrice",function(p) { return priceTypeIsLimit(p) || priceTypeIsStopLimit(p); },this._validateAsFloat.bind(this),
            "stopPrice",function(p) { return priceTypeIsStop(p) || priceTypeIsStopLimit(p); }, this._validateAsFloat.bind(this),
            "allOrNone",false,this._validateAsBool.bind(this),
            "quantity",true,this._validateAsInt.bind(this),
            "reserveOrder",false,this._validateAsBool.bind(this),
            "reserveQuantity",function(p) { return p.reserveOrder; },this._validateAsInt.bind(this),
            "marketSession",true,this._validateAsOneOf(["REGULAR","EXTENDED"]),
            "orderTerm",true,this._validateAsOneOf(["GOOD_UNTIL_CANCEL","GOOD_FOR_DAY","IMMEDIATE_OR_CANCEL","FILL_OR_KILL"]),
            "routingDestination",false,this._validateAsOneOf(["AUTO","ARCA","NSDQ","NYSE"]),
        ]);
    }
    
    var validationResult = this._validateParams(this.placeEquityOrderDescriptors,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "placeequityorder",
            useJSON: true,
    };

    var wrappedParams = { PlaceEquityOrder : { "-xmlns": "http://order.etws.etrade.com", EquityOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports.previewEquityOrderChange = function(params,successCallback,errorCallback)
{
    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-PreviewEquityOrderChange
    //
    // accountId       integer required    Numeric account ID
    // orderNum        integer required    Order number, taken from a previous response, that identifies the order to be changed
    // priceType       enum    required    The type of pricing. Possible values are:
    //                                       • MARKET
    //                                       • LIMIT
    //                                       • STOP
    //                                       • STOP_LIMIT
    //                                       • MARKET_ON_CLOSE
    //                                     If STOP, requires a stopPrice. If LIMIT, requires a limitPrice. If STOP_LIMIT, requires both.
    // limitPrice      double  conditional The highest price at which to buy or the lowest price at which to sell. Required if priceType is LIMIT.
    // stopPrice       double  conditional The price at which to buy or sell if specified in a stop order. Required if priceType is STOP.
    // allOrNone       boolean optional    If TRUE, the transactions specified in the order must be executed all at once, or not at all. Default is FALSE.
    // quantity        integer required    The number of shares to buy or sell
    // reserveOrder    boolean optional    If TRUE, publicly displays only a limited number of shares (the reserve quantity), instead of the entire order, to avoid influencing other traders. Default is FALSE. If TRUE, must also specify the reserveQuantity.
    // reserveQuantity integer conditional The number of shares displayed for a reserve order. Required if reserveOrder is TRUE.
    // orderTerm       enum    required    Specifies the term for which the order is in effect. Possible values are:
    //                                       • GOOD_UNTIL_CANCEL
    //                                       • GOOD_FOR_DAY
    //                                       • IMMEDIATE_OR_CANCEL (only for limit orders)
    //                                       • FILL_OR_KILL (only for limit orders)
    // clientOrderId   string  optional    A reference number generated by the developer. Used to ensure that a duplicate order is not being submitted. It can be any value of 20 alphanumeric characters or less, but must be unique within this account. It does not appear in any API responses.

    if (!this.previewEquityOrderChangeDescriptors)
    {
        var priceTypeIsStop = function(p) { return p.priceType == "STOP"; };
        var priceTypeIsStopLimit = function(p) { return p.priceType == "STOP_LIMIT"; };
        var priceTypeIsLimit = function(p) { return p.priceType == "LIMIT"; };
        
        this.previewEquityOrderChangeDescriptors = this._buildParamsDescriptor([
            "accountId", true, this._validateAsInt.bind(this),
            "orderNum",true, this._validateAsInt.bind(this),
            "priceType",true,this._validateAsOneOf(["MARKET","LIMIT","STOP","STOP_LIMIT","MARKET_ON_CLOSE"]),
            "limitPrice",function(p) { return priceTypeIsLimit(p) || priceTypeIsStopLimit(p); },this._validateAsFloat.bind(this),
                                        // Note that the E*TRADE documentation here does not specify STOP_LIMIT, but all the other
                                        // services that use this parameter do include STOP_LIMIT, so I am viewing this as
                                        // documentation error on this service (and its place counterpart)
            "stopPrice",function(p) { return priceTypeIsStop(p) || priceTypeIsStopLimit(p); }, this._validateAsFloat.bind(this),
            "allOrNone",false,this._validateAsBool.bind(this),
            "quantity",true,this._validateAsInt.bind(this),     // The example request does not have this parameter, yet the documentation has it as required?
            "reserveOrder",false,this._validateAsBool.bind(this),
            "reserveQuantity",function(p) { return p.reserveOrder; },this._validateAsInt.bind(this),
            "orderTerm",true,this._validateAsOneOf(["GOOD_UNTIL_CANCEL","GOOD_FOR_DAY","IMMEDIATE_OR_CANCEL","FILL_OR_KILL"]),
            "clientOrderId",false,this._validateAsString.bind(this),
        ]);
    }
    
    var validationResult = this._validateParams(this.previewEquityOrderChangeDescriptors,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "previewchangeequityorder",
            useJSON: true,
    };

    var wrappedParams = { previewChangeEquityOrder : { "-xmlns": "http://order.etws.etrade.com", changeEquityOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports.placeEquityOrderChange = function(params,successCallback,errorCallback)
{
    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-PlaceEquityOrderChange
    //
    // accountId       integer required    Numeric account ID
    // orderNum        integer required    Order number, taken from a previous response, that identifies the order to be changed
    // clientOrderId   string  optional    A reference number generated by the developer. Used to ensure that a duplicate order is not being submitted. It can be any value of 20 alphanumeric characters or less, but must be unique within this account. It does not appear in any API responses.
    // previewId       long    optional    If the change was not previewed, this parameter should not be specified. If the change was previewed, this parameter must specify the numeric preview ID from the preview, and other parameters of this request must match the parameters of the preview.
    // priceType       enum    required    The type of pricing. Possible values are:
    //                                       • MARKET
    //                                       • LIMIT
    //                                       • STOP
    //                                       • STOP_LIMIT
    //                                       • MARKET_ON_CLOSE
    //                                     If STOP, requires a stopPrice. If LIMIT, requires a limitPrice. If STOP_LIMIT, requires both.
    // limitPrice      double  conditional The highest price at which to buy or the lowest price at which to sell. Required if priceType is LIMIT.
    // stopPrice       double  conditional The price at which to buy or sell if specified in a stop order. Required if priceType is STOP.
    // allOrNone       boolean optional    If TRUE, the transactions specified in the order must be executed all at once, or not at all. Default is FALSE.
    // quantity        integer required    The number of shares to buy or sell
    // reserveOrder    boolean optional    If TRUE, publicly displays only a limited number of shares (the reserve quantity), instead of the entire order, to avoid influencing other traders. Default is FALSE. If TRUE, must also specify the reserveQuantity.
    // reserveQuantity integer conditional The number of shares displayed for a reserve order. Required if reserveOrder is TRUE.
    // orderTerm       enum    required    Specifies the term for which the order is in effect. Possible values are:
    //                                       • GOOD_UNTIL_CANCEL
    //                                       • GOOD_FOR_DAY
    //                                       • IMMEDIATE_OR_CANCEL (only for limit orders)
    //                                       • FILL_OR_KILL (only for limit orders)

    if (!this.placeEquityOrderChangeDescriptors)
    {
        var priceTypeIsStop = function(p) { return p.priceType == "STOP"; };
        var priceTypeIsStopLimit = function(p) { return p.priceType == "STOP_LIMIT"; };
        var priceTypeIsLimit = function(p) { return p.priceType == "LIMIT"; };
        
        this.placeEquityOrderChangeDescriptors = this._buildParamsDescriptor([
            "accountId", true, this._validateAsInt.bind(this),
            "orderNum",true, this._validateAsInt.bind(this),
            "clientOrderId",false,this._validateAsString.bind(this),
            "previewId",false,this._validateAsInt.bind(this), 
            "priceType",true,this._validateAsOneOf(["MARKET","LIMIT","STOP","STOP_LIMIT","MARKET_ON_CLOSE"]),
            "limitPrice",function(p) { return priceTypeIsLimit(p) || priceTypeIsStopLimit(p); },this._validateAsFloat.bind(this),
                                        // Note that the E*TRADE documentation here does not specify STOP_LIMIT, but all the other
                                        // services that use this parameter do include STOP_LIMIT, so I am viewing this as
                                        // documentation error on this service (and its preview counterpart)
            "stopPrice",function(p) { return priceTypeIsStop(p) || priceTypeIsStopLimit(p); }, this._validateAsFloat.bind(this),
            "allOrNone",false,this._validateAsBool.bind(this),
            "quantity",true,this._validateAsInt.bind(this),     // The example request does not have this parameter, yet the documentation has it as required?
            "reserveOrder",false,this._validateAsBool.bind(this),
            "reserveQuantity",function(p) { return p.reserveOrder; },this._validateAsInt.bind(this),
            "orderTerm",true,this._validateAsOneOf(["GOOD_UNTIL_CANCEL","GOOD_FOR_DAY","IMMEDIATE_OR_CANCEL","FILL_OR_KILL"]),
        ]);
    }
    
    var validationResult = this._validateParams(this.placeEquityOrderChangeDescriptors,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "placechangeequityorder",
            useJSON: true,
    };

    var wrappedParams = { placeChangeEquityOrder : { "-xmlns": "http://order.etws.etrade.com", changeEquityOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
    
};

// Okay, all this copy-paste is getting really old.  Let's try something different for option orders.
exports._buildOptionOrderDescriptor = function()
{
    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-PreviewOptionOrder
    //
    // accountId           integer required    Numeric account ID
    // symbolInfo          complex required    Container for symbol information
    //  -> symbol          string  required    The market symbol for the underlier
    //  -> callOrPut       enum    required    Option type - specifies either CALL or PUT
    //  -> strikePrice     double  required    The strike price for this option
    //  -> expirationYear  integer required    The 4-digit year the option will expire
    //  -> expirationMonth integer required    The month (1-12) the option will expire
    //  -> expirationDay   integer required    The day (1-31) the option will expire
    // orderAction         enum    required    The action that the broker is requested to perform. Possible values are:
    //                                               • BUY_OPEN
    //                                               • SELL_OPEN
    //                                               • BUY_CLOSE
    //                                               • SELL_CLOSE
    // priceType           enum    required    The type of pricing specified in the equity order. Possible values are:
    //                                               • MARKET
    //                                               • LIMIT
    //                                               • STOP
    //                                               • STOP_LIMIT
    //                                         If STOP, requires a stopPrice. If LIMIT, requires a limitPrice. If STOP_LIMIT, requires a stopLimitPrice.
    // limitPrice          double  conditional The highest price at which to buy or the lowest price at which to sell. Required if priceType is LIMIT.
    // stopPrice           double  conditional The price at which to buy or sell if specified in a stop order. Required if priceType is STOP.
    // stopLimitPrice      double  conditional The designated price for a stop-limit order. Required if priceType is STOP_LIMIT.
    // allOrNone           boolean optional    If TRUE, the transactions specified in the order must be executed all at once, or not at all. Default is FALSE.
    // quantity            integer required    The number of shares to buy or sell
    // reserveOrder        boolean optional    If TRUE, publicly displays only a limited number of shares (the reserve quantity), instead of the entire order, to avoid influencing other traders. Default is FALSE. If TRUE, must also specify the reserveQuantity.
    // reserveQuantity     integer conditional The number of shares displayed for a reserve order. Required if reserveOrder is TRUE.
    // orderTerm           enum    required    Specifies the term for which the order is in effect. Possible values are:
    //                                               • GOOD_UNTIL_CANCEL
    //                                               • GOOD_FOR_DAY
    //                                               • IMMEDIATE_OR_CANCEL (only for limit orders)
    //                                               • FILL_OR_KILL (only for limit orders)
    // routingDestination  enum    optional    The exchange where the order should be executed. Users may want to specify this if they believe they can get a better order fill at a specific exchange, rather than relying on the automatic order routing system. Possible values are:
    //                                               • AUTO (default)
    //                                               • ARCA
    //                                               • NSDQ
    //                                               • NYSE
    // clientOrderId       string  optional    A reference number generated by the developer. Used to ensure that a duplicate order is not being submitted. It can be any value of 20 alphanumeric characters or less, but must be unique within this account. It does not appear in any API responses.

    return this._buildParamsDescriptor([
        "accountId", true, this._validateAsInt.bind(this),
        "symbolInfo", true, this._validateAsComplex(
            this._buildParamsDescriptor([
                "symbol",true,this._validateAsString.bind(this),
                "callOrPut",true,this._validateAsOneOf(["CALL","PUT"]),
                "expirationYear",true,this._validateAsInt.bind(this),
                "expirationMonth",true,this._validateAsInt.bind(this),
                "expirationDay",true,this._validateAsInt.bind(this)])),
        "orderAction",true,this._validateAsOneOf(["BUY_OPEN","SELL_OPEN","BUY_CLOSE","SELL_CLOSE"]),
        "priceType",true,this._validateAsOneOf(["MARKET","LIMIT","STOP","STOP_LIMIT"]),
        "limitPrice",function(p) { return p.priceType == "LIMIT"; },this._validateAsFloat.bind(this),
        "stopPrice",function(p) { return p.priceType == "STOP"; },this._validateAsFloat.bind(this),
        "stopLimitPrice",function(p) { return p.priceType == "STOP_LIMIT"; },this._validateAsFloat.bind(this),
        "allOrNone",false,this._validateAsBool.bind(this),
        "quantity",true,this._validateAsInt.bind(this),
        "reserveOrder",false,this._validateAsBool.bind(this),
        "reserveQuantity",function(p) { return p.reserveOrder; },this._validateAsInt.bind(this),
        "orderTerm",true,this._validateAsOneOf(["GOOD_UNTIL_CANCEL","GOOD_FOR_DAY","IMMEDIATE_OR_CANCEL","FILL_OR_KILL"]),
        "routingDestination",false,this._validateAsOneOf(["AUTO","ARCA","NSDQ","NYSE"]),
        "clientOrderId",false,this._validateAsString.bind(this),
    ]);
};

exports.previewOptionOrder = function(params,successCallback,errorCallback)
{
    if (!this.previewOptionOrderDescriptor)
    {
        this.previewOptionOrderDescriptor = this._buildOptionOrderDescriptor();
    }
    
    var validationResult = this._validateParams(this.previewOptionOrderDescriptor,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "previewoptionorder",
            useJSON: true,
    };

    var wrappedParams = { PreviewOptionOrder : { "-xmlns": "http://order.etws.etrade.com", OptionOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports.placeOptionOrder = function(params,successCallback,errorCallback)
{
    if (!this.placeOptionOrderDescriptor)
    {
        this.placeOptionOrderDescriptor = this._buildOptionOrderDescriptor();
        this.placeOptionOrderDescriptor.push({ 
            name:"previewId", 
            required:false, 
            validator:this._validateAsInt.bind(this) 
        });
    }
    
    var validationResult = this._validateParams(this.placeOptionOrderDescriptor,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "placeoptionorder",
            useJSON: true,
    };

    var wrappedParams = { PlaceOptionOrder : { "-xmlns": "http://order.etws.etrade.com", OptionOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports._buildOptionOrderChangeDescriptor = function()
{

    //
    // From the etrade dev portal at 
    // https://us.etrade.com/ctnt/dev-portal/getDetail?contentUri=V0_Documentation-OrderAPI-PreviewOptionOrderChange

    return this._buildParamsDescriptor([
        "accountId", true, this._validateAsInt.bind(this),
        "orderNum",true, this._validateAsInt.bind(this),
        "clientOrderId",false,this._validateAsString.bind(this),
        "previewId",false,this._validateAsInt.bind(this), 
        "priceType",true,this._validateAsOneOf(["MARKET","LIMIT","STOP","STOP_LIMIT","MARKET_ON_CLOSE"]),
        "limitPrice",function(p) { return p.priceType == "LIMIT"; },this._validateAsFloat.bind(this),
        "stopPrice",function(p) { return p.priceType == "STOP"; }, this._validateAsFloat.bind(this),
        "stopLimitPrice",function(p) { return p.priceType == "STOP_LIMIT"; }, this._validateAsFloat.bind(this),
        "allOrNone",false,this._validateAsBool.bind(this),
        "quantity",true,this._validateAsInt.bind(this),     // The example request does not have this parameter, yet the documentation has it as required?
        "reserveOrder",false,this._validateAsBool.bind(this),
        "reserveQuantity",function(p) { return p.reserveOrder; },this._validateAsInt.bind(this),
        "orderTerm",true,this._validateAsOneOf(["GOOD_UNTIL_CANCEL","GOOD_FOR_DAY","IMMEDIATE_OR_CANCEL","FILL_OR_KILL"]),
    ]);
};

exports.previewOptionOrderChange = function(params,successCallback,errorCallback)
{
    if (!this.previewOptionOrderChangeDescriptor)
    {
        this.previewOptionOrderChangeDescriptor = this._buildOptionOrderChangeDescriptor();
    }
    
    var validationResult = this._validateParams(this.previewOptionOrderChangeDescriptor,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "previewchangeoptionorder",
            useJSON: true,
    };

    var wrappedParams = { PreviewChangeOptionOrder : { "-xmlns": "http://order.etws.etrade.com", ChangeOptionOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports.placeOptionOrderChange = function(params,successCallback,errorCallback)
{
    if (!this.placeOptionOrderChangeDescriptor)
    {
        this.placeOptionOrderDescriptor = this._buildOptionOrderDescriptor();
        this.placeOptionOrderChangeDescriptor.push({ 
            name:"previewId", 
            required:false, 
            validator:this._validateAsInt.bind(this) 
        });
    }
    
    var validationResult = this._validateParams(this.placeOptionOrderChangeDescriptor,params);
    if (validationResult.length)
        return errorCallback(validationResult); // Validation failed

    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "placechangeoptionorder",
            useJSON: true,
    };

    var wrappedParams = { PlaceChangeOptionOrder : { "-xmlns": "http://order.etws.etrade.com", ChangeOptionOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

exports.cancelOrder = function(params,successCallback,errorCallback)
{
    if (!this.cancelOrderDescriptor)
    {
        this.cancelOrderDescriptor = this._buildParamsDescriptor([
            "accountId",true,this._validateAsInt.bind(this),
            "orderNum",true,this._validateAsInt.bind(this)
        ]);
    }
    
    var validationResult = this._validateParams(this.cancelOrderDescriptor,params);
    if (validationResult.length)
        return errorCallback(validationResult);
    
    var actionDescriptor = {
            method : "POST",
            module : "order",
            action : "cancelorder",
            useJSON : true,
    };
    
    var wrappedParams = { cancelOrder : { "-xmlns": "http://order.etws.etrade.com", cancelOrderRequest:params }};
    
    this._run(actionDescriptor,wrappedParams,successCallback,errorCallback);
};

