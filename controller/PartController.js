
export const createPart = async (req, res, next) => {
    try{
        return res.status(200).json({message: "Backend Test"})
    } catch(error){
        next(error)
    }
}