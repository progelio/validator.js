//Author: Rogelio Prestol
//https://github.com/progelio/validator.js

var validator = function () {
    "use strict"
    function $(q) { return document.querySelector(q) }
    function $$(r, q) { return _toArray(r.querySelectorAll(q)) }
    function $split(a, b) { return a.split(b).filter(function (x) { return x != "" }) }

    function _addCss(r, css) {
        var all = $split(r.className, " "), add = $split(css, " ")
        add.forEach(function (a) {
            if (all.filter(function (x) {
                return x == a
            }).length == 0) {
                all.push(a)
            }
        })
        r.className = all.join(" ")
    }

    function _delCss(r, css) {
        var all = $split(r.className, " "), list = [], del = $split(css, " ")

        all.forEach(function (x) {
            if (del.filter(function (d) {
                return x == d
            }).length == 0) {
                list.push(x)
            }
        })

        r.className = list.join(" ")
    }

    //needed for ie11, convert to array
    function _toArray(data) { return Array.prototype.slice.call(data) }

    var _rules = {
        required: { regex: /^.{1,}$/m, error: "{0} is required." },
        email: { regex: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, error: "{0} is not an email address." },
        number: { regex: /^-?\d+(.\d+)?$/, error: "{0} is not a number." },
        integer: { regex: /^-?\d+$/, error: "{0} is not an integer." },
        float: { regex: /^-?\d+[.]\d+$/, error: "{0} is not a float." },
        date: { regex: /^(\d{1,2})[/](\d{1,2})[/](\d{2}(\d{2})?)(\s\d{1,2}[:]\d{2}([:]\d{2})?\s(am|pm))?$/i, error: "{0} is not a date." },
        ssn: { regex: /^\d{3}-\d{2}-\d{4}$/, error: "{0} is not a social security number." },
        creditcard: { regex: /^\d{15,16}$/, error: "{0} is not a credit card number." },
        maxlength: { error: "{0} must not exceed {1} characters." },
        minlength: { error: "{0} must not be less than {1} characters." },
        max: { error: "{0} must not be greater than {1}." },
        min: { error: "{0} must not be less than {1}." },
        length: { error: "{0} must be {1} characters long." },
        url: { regex: /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?(\?.*)?$/, error: "{0} is not a valid URL." },
        pattern: { error: "{0} is not valid." },
        zip: { regex: /^\d{5}(-\d{4})?$/, error: "{0} is not a valid postal code." },
        phone: { regex: /^((\(\d{3}\)?)|(\d{3}-))?\d{3}-\d{4}$/, error: "{0} is not a valid phone." },
        compare: { error: "{0} does not match." },
        not: { error: "{0} is not allowed." },
        any: { error: "{0} is not allowed." },
        custom: { error: "{0} is invalid." }
    }

    function _value(rule, value, type, args) {
        //handles null or undefined
        value = value == null ? "" : value

        //in case type is not passed
        type = type || typeof value

        //should not be validated if the value is empty.
        if (rule != "required" && value === "" && !validator.config.validateEmptyValues) {
            return true
        }
        if (rule == "custom") {
            return args(value)
        }
        if (rule == "maxlength") {
            return value.length <= parseInt(args)
        }
        if (rule == "minlength") {
            return value.length >= parseInt(args)
        }
        if (rule == "pattern") {
            return (new RegExp("^" + args + "$")).test(value)
        }
        if (rule == "length") {
            return value.length == parseInt(args)
        }
        if (rule == "not") {
            return args.indexOf(value) == -1
        }
        if (rule == "any") {
            return args.indexOf(value) > -1
        }
        if (rule == "min") {
            switch (type) {
                case "integer":
                case "number":
                case "float":
                    return parseFloat(value) >= parseFloat(args)
                case "date":
                    return Date.parse(value) >= Date.parse(args)
                default: throw "Type is invalid."
            }
        }
        if (rule == "max") {
            switch (type) {
                case "integer":
                case "number":
                case "float":
                    return parseFloat(value) <= parseFloat(args)
                case "date":
                    return Date.parse(value) <= Date.parse(args)
                default: throw "Type is invalid."
            }
        }
        if (rule == "compare") {
            return args == value
        }
        if (rule == "date") {
            var b = args.test(value) //args is a regex
            if (!b) { return b }

            var d = new Date(value)
            if (d == "Invalid Date") { return false }

            var date = value.replace(args, "$2") //args is a regex
            return d.getDate() == parseInt(date)
        }
        return args.test(value) //args is a regex
    }

    function _single(value, rules) {
        var failed = [], errors = [], type, args, label = rules["label"] || ""

        //findout what is the datatype expected.
        for (var ruleName in rules) {
            if (!rules.hasOwnProperty(ruleName)) { continue }
            if (["integer", "number", "float", "date"].indexOf(ruleName) > -1) { type = ruleName; break }
        }

        for (var ruleName in rules) {
            if (!rules.hasOwnProperty(ruleName)) { continue }
            var x = _rules[ruleName]
            if (!x) { continue }

            var error = x.error

            if ("regex" in x) {
                args = x.regex
            } else {
                args = rules[ruleName]
                if (ruleName == "pattern") { } else //nothing intended
                    if (ruleName == "compare") { args = arguments[2] } else
                        if (ruleName == "any" || ruleName == "not") { } else
                            if (typeof args == "object") {
                                error = args.error || error
                                args = args.value
                            }
            }

            if (type == "date" && value && value.toLocaleString) {
                value = value.toLocaleString().replace(",", "")
            }

            if (!_value(ruleName, value, type, args)) {
                failed.push(ruleName)
                error = error.replace(/\{(0|label)\}/g, label).replace(/\{(1|value)\}/g, args).trim()
                errors.push(error)
            }
        }

        if (failed.length > 0) {
            return { label: label, failed: failed, errors: errors }
        }
    }

    function _multiple(data, rules) {
        var result = []

        for (var prop in rules) {
            if (!rules.hasOwnProperty(prop)) { continue }
            var rule = rules[prop]
            rule.label = rule.label || prop
            var errors = _single(data[prop], rule, data[rule.compare])
            if (!errors) { continue }
            errors.name = prop
            result.push(errors)
        }

        return result
    }

    function _validate(selector) {
        if (arguments.length == 2) { return _multiple(arguments[0], arguments[1]) }

        //selector could be an element
        var root = typeof selector === "string" ? $(selector) : selector
        var elements = $$(root, "input[rules]:not(:disabled), select[rules]:not(:disabled), textarea[rules]:not(:disabled)")
        var result = []
        var warns = $$(root, "[rule-msg]")
        var summary = $$(root, "[rules-summary]")

        warns.forEach(function (m) {
            _delCss(m, "validator-error")
            _delCss(m, validator.config.errorCss)
            if (!m.$validator) {
                m.$validator = { template: m.innerHTML }
            }
        })

        summary.forEach(function (x) {
            _delCss(x, "validator-summary")
            _delCss(x, validator.config.errorSummaryCss)
            x.innerHTML = ""
        })

        elements.forEach(function (el) {
            var errors = [], failed = [], args
            var value = ["checkbox", "radio"].indexOf(el.type) > -1 ? (el.checked || "") : el.value
            var label = el.getAttribute("rules-label") || el.name || el.id
            var rules = $split(el.getAttribute("rules"), " ")
            var single = { label: label }

            rules.forEach(function (x) {
                var a = x.split("=")
                var ruleName = a[0]
                var ruleArgs = a.slice(1).join("=")

                single[ruleName] = ruleArgs || true

                if (ruleName == "custom") {
                    single.custom = validator.custom[ruleArgs]
                }

                if (ruleName == "compare") {
                    var compareEl = $$(root, "#" + ruleArgs)[0]
                    if (compareEl) { args = compareEl.value }
                }
            })

            if (!el.$validator) {
                el.$validator = {}
                el.addEventListener("blur", function () { validator.validate(selector) })
            }

            var b = _single(value, single, args)

            _delCss(el, "input-error")
            _delCss(el, validator.config.errorInputCss)

            if (b) {
                _addCss(el, "input-error")
                _addCss(el, validator.config.errorInputCss)
                b.name = el.name
                var warns = $$(root, "[rule-msg]")

                warns.forEach(function (m) {
                    var attr = m.getAttribute("rule-msg")
                    if (attr == el.name || attr == b.failed[0] || attr == el.name + "." + b.failed[0] || attr == "") {
                        _addCss(m, "validator-error")
                        _addCss(m, validator.config.errorCss)
                        m.innerHTML = m.$validator.template || b.errors[0]
                        m.innerHTML = m.innerHTML.replace(/\{(0|label)\}/g, b.label)
                    }
                })

                result.push(b)
            }
        })

        summary.forEach(function (x) {
            _addCss(x, "validator-summary")
            _addCss(x, validator.config.errorSummaryCss)

            var list = ""
            result.forEach(function (e) {
                if (e.errors.length > 0) {
                    list += "<li>" + e.errors.join("</li><li>") + "</li>"
                }
            })

            x.innerHTML = "<ul>" + list + "</ul>"
        })

        return result.filter(function (x) { if (x.errors.length > 0) { return x } })
    }

    var cssId = "validatorCss"

    if (!$(cssId)) {
        var s = document.createElement("style")
        s.id = cssId
        s.type = "text/css"
        s.innerHTML = "[rule-msg],[rules-summary]{position:absolute;left:-8000px}.validator-error,.validator-summary{position:static;left:auto}"
        $("head").appendChild(s)
    }

    return {
        config: {
            errorCss: "validator-error",
            errorInputCss: "input-error",
            errorSummaryCss: "validator-summary",
            validateEmptyValues: false
        },
        custom: {},
        validate: _validate,
        single: _single
    }
}()
