  import multer from "multer";

  const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"public")
},
filename:function(req,file,cb){
    const filename=Date.now()+"_"+file.originalname;
    cb(null,filename)
}
  })
   export const upload= multer({
    storage,
    limits:{fileSize:5*1024*1024},//5MB limit 
   });

   export const uploadResume = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF resumes are allowed"));
      }
      cb(null, true);
    }
   });
