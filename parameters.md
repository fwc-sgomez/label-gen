Purpose
-------------------

* The web app supports URL parameters to allow auto-populating part number, rev number, and, order number, and selecting which label to use. Excel integrations are simple, and other platforms that can generate URLs with the appropriate data is supported.
* For any issues, questions, or feature requests, please reach out.

Supported parameters
-------------------

* All parameters are optional.
```
p=<string, part number>
w=<string, work order>
cmp=<string, “cf” | “fwc”>
lbt=<number, 0-7> (see section below)
```

lbt codes
-------------------

* These codes are used to set which label type to set when opening the web app. These will override the default label or previously set label. If `lbt` is not set, the web app will default to the last used label or default label.
```
0: Machining WIP
1: Inventory, Limited shelf
2: Inventory, WIP to FG
3: Inventory, Revieve to inventory
4: QC, Pass
5: QC, Fail
6: QC, FAI
7: QC, Inspect
```

Examples
-------------------
* Excel hyperlink example:
    * This hyperlink will grab data in cell A1 and use it for the `p` part number paramter and data in cell B1 for the `w` work order parameter.
    * Customize this as needed for your spreadsheet.
```
=HYPERLINK("https://fwc-sgomez.github.io/label-gen/?p="&A1&"&w="&B1&”&lbt=0”, "print label")
```
* Example URL with some parameters:
```
https://fwc-sgomez.github.io/label-gen/?p=08025FN0001-00&w=012345-000&lbt=0
```