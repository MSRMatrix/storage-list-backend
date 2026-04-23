import Part from "../models/Part"


export const createPart = async (req, res, next) => {
    try{
const {
  partNumber,
  name,
  quantity,
  price,
  lowLimit,
  description
} = req.body;

const newPart = new Part({
  partNumber,
  name,
  quantity,
  price,
  lowLimit,
  description,
  userId: req.user.id,

});


res.status(200).json({data: newPart, message: "Part created"})
    } catch(error){
        next(error)
    }
}