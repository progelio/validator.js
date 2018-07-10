# validator.js
## Template Based

```html
    <div id="myForm">

        <input name="age" type="text" rules="required integer min=18 max=25 custom=myAgeFunction" rules-label="Age" />

        <div rule-msg="age"></div>

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
            console.log(errors)

            if (errors.length > 0) {
                return //abort submit
            }
        }
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
                custom: function (value) {
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
        console.log(errors)

        if (errors.length > 0) {
            return //abort submit
        }
    </script>
```html
