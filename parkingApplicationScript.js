function parkingApplied(e) {

    // Tasks:
    // 1. Send email to resident when he/she submits the form
    // 2. Send email to gradapts with the next steps
    // 3. Store the document names in a specific format like last year

    // collecting responses
    var response = e.response;
    var itemResponses = response.getItemResponses();

    // variables for resident name, room no and document id
    var name = '';
    var room = '';
    var docs = {
        "DL": {},
        "REG": {},
        "INS": {}
    };
    for (var i = 0; i < itemResponses.length; i++) {
        var itemResponse = itemResponses[i];
        var item = itemResponse.getItem();

        if (item.getTitle() == 'First Name, Last name')
            name = itemResponse.getResponse();

        if (item.getTitle() == 'Apartment Number')
            room = itemResponse.getResponse();


        if (item.getTitle() == 'Drivers License Expiration date') {
            docs["DL"]["expiry"] = itemResponse.getResponse();
        }
        if (item.getTitle() == 'Insurance Expiration date') {
            docs["REG"]["expiry"] = itemResponse.getResponse();
        }
        if (item.getTitle() == 'Registration Expiration date') {
            docs["INS"]["expiry"] = itemResponse.getResponse();
        }


        if (item.getTitle() == 'Drivers License') {
            docs["DL"]["fileId"] = itemResponse.getResponse();
        }
        if (item.getTitle() == 'Insurance') {
            docs["REG"]["fileId"] = itemResponse.getResponse();
        }
        if (item.getTitle() == 'Vehicle Registration') {
            docs["INS"]["fileId"] = itemResponse.getResponse();
        }
    }

    // Task 1: Send email to resident
    notifyResident(response, name, room);

    // Task 2: Send email to RGA staff
    notifyRGA(response, name, room);


    // Task 3: Store the documents in the specified format
    renameFiles(name, room, docs);

}

function notifyResident(response, name, room) {

    var residentEmail = response.getRespondentEmail();
    var resSub = "Parking Application Submitted: Verification Pending";
    var resBody = `Dear ${name} (${room}),
  
  Your parking application has been submitted and is under review. Once the verification is complete, you will receive the parking addendum.

  Please sign it as soon as possible, so that a parking slot, gate clicker and a parking tag will be allotted for you. You will be notified about the parking slot soon. You could collect the gate clicker and parking tag from the RGA office after you get a confirmation email from gradapts@rice.edu.
  
  Regards,
  RGA Management,
  Rice Graduate Apartments,
  1515 Bissonnet St `


    MailApp.sendEmail(residentEmail, resSub, resBody);
}

function notifyRGA(response, name, room) {
    var formUrl = response.getEditResponseUrl();

    var formOwnerEmail = "bt22@rice.edu"; // Replace with the actual email address of the form owner
    var staffEmail = "gradapts@rice.edu";

    var staffSub = "Parking Form Response for Manual Verification";
    var staffBody = `Hey,
  
  ${name} (${room}) has submitted his/her parking documents. Link to the documents can be found in the parking section of the Master Spreadsheet (https://docs.google.com/spreadsheets/d/1OI4kW6y9ln8qjtynSO_Ld-UUNVOxi9MQgsoNjHmvOHU/edit#gid=359214049). If documents/information is missing please remove the data from the spreadsheet. Notify resident about the missing information and ask the resident to submit another response. 
  
  Next steps if documents are verified:
  1. Generate the parking addendum via onesite
  2. Send an email to resident notifying the parking addendum has been sent and ask them to sign the document at the earliest
  3. Once the documents are signed, allot a slot and update in the parking spreadsheet of the master spreadsheet
  4. Notify the resident regarding the same

  Form response: ${formUrl} 

  Regards,
  Benson Thomas,
  Resident Associate,
  Rice Graduate Apartments`;

    // send same email to gradapts and formOwner
    MailApp.sendEmail(formOwnerEmail, staffSub, staffBody);
    MailApp.sendEmail(staffEmail, staffSub, staffBody);
}

function renameFiles(name, room, docs) {
    var DL_Folder = DriveApp.getFolderById("1P9U5-Nn7K5gB8j184kXQW9XHd2U6YIkT6-dfmvft62eh_XVf2KfWFSeog5Ur73KYGPnXUb-P"); // DL folder ID.
    var Reg_Folder = DriveApp.getFolderById("1qI-N6VmkrthH-YSbzmcwk1PsvgF2iIFV1juz6JigMgI48SaWTafAHSc4CHXvE9S9q5hNetXk"); // Registration folder ID.
    var INS_Folder = DriveApp.getFolderById("1HzR8pwKmf2Q3LqKTza2wDjyOYdmBgGCI5xo1siIQMsB5cV-E4z6OU7o11GsXD-TOEe6hBo4P"); // Insurance folder ID.

    var destinationFile = '';
    var file = '';
    for (let doc_type in docs) {

        file = DriveApp.getFileById(docs[doc_type]["fileId"]);
        switch (doc_type) {
            case "DL":
                destinationFile = file.makeCopy(DL_Folder);
                break;
            case "REG":
                destinationFile = file.makeCopy(Reg_Folder);
                break;
            case "INS":
                destinationFile = file.makeCopy(INS_Folder);
                break;
        }

        // Rename the file with the desired name
        destinationFile.setName(`${room}_${doc_type}_${docs[doc_type]["expiry"]}_${name}`);
    }

}
