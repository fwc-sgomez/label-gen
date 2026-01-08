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
src=<string> (see section below)
desc=<string>
rid=<integer>
qty=<integer>
dept=<string>
ptn=<string>
```

src codes
-------------------

* These codes are used to set which label type to set when opening the web app. These will override the default label or previously set label. If `src` is not set, the web app will default to the last used label or default label.
```
machwip: Machining WIP
invltdshelf: Inventory, Limited shelf
invwipfg: Inventory, WIP to FG
invrev: Inventory, Recieve to inventory
invconsumables: Inventory, Consumable request fulfilment
qcpass: QC, Pass
qcfail: QC, Fail
qcfai: QC, FAI
qcinsp: QC, Inspect
srstd: S&R, standard label
```

Examples
-------------------
* Excel hyperlink example:
    * This hyperlink will grab data in cell A1 and use it for the `p` part number paramter and data in cell B1 for the `w` work order parameter.
    * Customize this as needed for your spreadsheet.
```
=HYPERLINK("https://fwc-sgomez.github.io/label-gen/?p="&A1&"&w="&B1&”&src=machwip”, "print label")
```
* Example URL with some parameters:
```
https://fwc-sgomez.github.io/label-gen/?p=08025FN0001-00&w=012345-000&src=machwip
```

Revision history
-------------------
* Revision history can be viewed on [GitHub](https://github.com/fwc-sgomez/label-gen/commits/main/parameters.md).
