const fs = require('fs');
var prompt = require('prompt');

//
// Start the prompt
//
prompt.start();

// Get APIs Name
// validate the User Input
//  Validate Existence of file or Folder
//  Create File or Folder

prompt.get(
  [
    {
      name: 'API_Name',
      description: 'Enter API  Name',
      message: 'Api  name  already Exists or Invalid Folder Name: Do not use "/" at start ',
      conform: function (value) {
        if (value.indexOf('/') === 0) return false;
        if (!fs.existsSync(`${value}`)) return true;
      },
    },
  ],
  function (err, result) {
    const API_Name = capitalizeFirstLetter(result.API_Name);
    let API_File_Name = API_Name;

    console.log(API_Name);

    // Transform the file /folder Name

    if (API_Name.includes('/')) {
      API_File_Name = getFileName(API_Name);
    }

    const file = [
      `${API_File_Name}.Models.ts`,
      `${API_File_Name}.Controller.ts`,
      `${API_File_Name}.Validator.ts`,
      `${API_File_Name}.Routes.ts`,
      `${API_File_Name}.Middleware.ts`,
    ];
    try {
      if (!fs.existsSync(API_Name)) {
        fs.mkdirSync(API_Name);

        file.map((file) => {
          fs.open(API_Name + '/' + file, 'w', function (err, fileDescriptor) {
            if (!err && fileDescriptor) {
              console.log('Created File', file);
            } else {
              console.log('could not create new file , it may already exist', err);
            }
          });
        });
      }
    } catch (err) {
      console.error('Folder already Exist');
    }
  }
);

const capitalizeFirstLetter = (name) => {
  return name
    .split('/')
    .map((fileName) => fileName.charAt(0).toUpperCase() + fileName.slice(1))
    .join('/');
};

const getFileName = (name) => {
  return name.slice(name.lastIndexOf('/') + 1, name.length);
};
