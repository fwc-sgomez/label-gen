Purpose
-------------------
* The FWCPrintApp was designed to make the printer setup process significantly easier, and reduce the chances of a rouge printer configuration from preventing labels from printing properly. 
* The Label Generator web app will continue to support "built-in" printing
* This app does not replace the web app component. All labels will be created using the web app. This app is only to handle printing.

Supported printers and labels
-------------------
* The app has been tested to work with Dymo printers.
* 99014 Shipping/Name Badge Labels have been tested to work. Other sizes should work, but compatibility is not guranteed.
* NOTE: The print app does not support adding new printers. All Dymo printers must be added from within the Dymo software. Once the printer has been added into the Dymo software

Installation
-------------------
1. Install files are located in `Y:\Software\`
1. Open the `dotnet` folder and copy `windowsdesktop-runtime-10.0.1-win-x64` to your desktop and run the installer.
1. Click on "Install" and let the installer finish.
1. Once finished, go back to the `Software` folder and find `Install FWCPrintApp`. Copy the installer to your desktop and run the installer.
1. When the installer opens, click on "Install only for me"
1. Once the installer finishes, there is a checkbox "Launch FWCPrintApp" that is checked. Leave it checked so that the app can be configured.
1. The app will open and will ask to select a printer.
1. Click on the "Settings" tab and select the printer to be used.
1. The app has now been installed and ready for use. It's safe to close the app now.

Testing configuration
-------------------
1. Open the web app, and look for the "Print using" drop down menu. Select "FWCPrintApp"
1. Click on the print button. The label does not need to be filled out as this is just to test the configuration.
1. A new tab will open and will ask if the app should be opened. Click on the "always open this application" check box and then click "open"
1. The print app should open and should show a preview of the label. 
1. Click print or hit the "Enter" key to print.
1. Check the printer and make sure the label came out correctly.

Issues
-------------------
* If labels are not printing, make sure the correct printer is selected. Give the printer the ol unplug and plug back in (and turn it on). 
* If labels are not printing correctly, open the print app and check the settings. The label should be "99014 Shipping" or "99014 Name Badge Label"
* If the correct label is selected and it's still not printing correctly, please contact Saul directly.
* If there are other issues, such as app crashes or anything else, please contact Saul directly.

Revision history
-------------------
* Revision history of this document can be viewed on [GitHub](https://github.com/fwc-sgomez/label-gen/commits/main/appinstall.md).