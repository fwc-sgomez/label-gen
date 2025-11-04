# what

Easy to use label generator for creating part labels and other types of labels in the future. 

# why

This automates label creation and generates the correct part field consistently without the user having to count spaces or know that a certain number of spaces are required.
This tool accepts some query parameters that can be used to automatically populate the part number, rev number, and work order number.
*Some* human error can be removed by having some validations in place before a label is printed out too.

# query parameters

a small list of currently accepted query parameters:

`p=partNumber` as string, can be with or without rev number
`w=workOrder` as string
`src=source` as string, to determine which label to use
 
