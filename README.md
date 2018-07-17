# validator.js
## Using a Template

```html
<div id="myForm">
    <input name="age" type="text" rules="required integer min=18 max=25 custom=myAgeFunction" rules-label="Age" />
    <button onclick="send()">Submit</buttom>
</div>

<script>
    function send() {
        validator.custom.myAgeFunction = function (age) {
            if (age == 20) {
                return false
            }

            return true
        }

        var errors = validator.validate("#myForm")

        if (errors.length > 0) {
            return //abort submit
        }
    }
</script>
```

### Displaying Errors

This will catch any error for any field and display a default validation message:
```html
<div rule-msg></div>
```

Or, you can display a static message:
```html
<div rule-msg>Please fix all invalid fields.</div>
```

You can catch and display any validation rule:
```html
<div rule-msg="required"></div>
```

Display a field name or label for your validation error:
```html
<div rule-msg="required">{label} is also required.</div>
```

Or, you can simply display errors for a particular field-rule combination:
```html
<div rule-msg="age.required">Your age is required.</div>
```

When these errors are displayed, a class name is added to the element: "validator-error".

### Displaying Errors - Summary

To display a simple default list of errors, do the following:
```html
<div rules-summary></div>
```
This will diplay a list of errors using unordered list (ul). When the summary is displayed, a class name will be added to the element: "validator-summary".

### Displaying Errors - Styling

When validation fails, a class name is added to the input field that failed. The name of this class is "input-error" and will end up looking like this:

```html
<input type="text" rules="integer required" class="input-error" />
```

For the validation summary, a class name "validator-summary" will be added and it will look like:
```html
<div rules-summary class="validator-summary"></div>
```

You can also add your css class names like:

```html
<script>
    validator.config.errorCss = "myFailedMsgClass";
    validator.config.errorInputCss = "myInputClass";
    validator.config.errorSummaryCss = "mySummaryCss";
</script>
```


## Without a Template
```html
<script>
    var rules = {
        age: {
            label: "Age",
            required: true,
            integer: true,
            min: 18,
            max: 25,
            custom: function (age) {
                if (age == 20) {
                    return false
                }

                return true
            }
        }
    }

    var data = {
        age: 15
    }

    var errors = validator.validate(data, rules)

    if (errors.length > 0) {
        return //abort submit
    }
</script>
```
