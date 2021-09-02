const Sauces = require("../models/Sauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauces({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [" "],
    usersdisLiked: [" "],
  });

  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  if (req.file) {
    Sauces.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => { 
          const sauceObject =  {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            } 
            Sauces.updateOne(
              { _id: req.params.id },
              { ...sauceObject, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Sauce modifié !" }))
              .catch((error) => res.status(400).json({ error }));
          
        });
      })
      .catch((error) => res.status(500).json({ error }))
  }
  const sauceObject =  { ...req.body };
  Sauces.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauces.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauces.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
// post pour like/dislike

exports.likesdislikes = (req, res, next) => {
  const user = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;

  // mise en place d'un switch :
  switch (like) {
    //  si like = 1 l'utilisateur like la sauce , utilisation des opérateurs de mise à jour mongodb

    /*  $pull : Removes all array elements that match a specified query.
    $push : Adds an item to an array.

    $inc : Increments the value of the field by the specified amount.
*/
    case 1:
      Sauces.updateOne(
        { _id: sauceId },
        { $push: { usersLiked: user }, $inc: { likes: +1 } }
      )
        .then(() => res.status(200).json({ message: "Sauce liké !" }))
        .catch((error) => res.status(400).json({ error }));

      break;
    //  si like = -1 l'utilisateur dislike la sauce , utilisation des opérateurs de mise à jour mongodb
    case -1:
      Sauces.updateOne(
        { _id: sauceId },
        { $push: { usersDisliked: user }, $inc: { dislikes: +1 } }
      )
        .then(() => res.status(200).json({ message: "Sauce disliké !" }))
        .catch((error) => res.status(400).json({ error }));

      break;
    //  si like = 0 l'utilisateur annule son like ou son dislike de  la sauces , utilisation des opérateurs de mise à jour mongodb
    case 0:
      Sauces.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(user)) {
            Sauces.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: user }, $inc: { likes: -1 } }
            )
              .then(() => res.status(200).json({ message: "Sauce neutre !" }))
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(user)) {
            Sauces.updateOne(
              { _id: sauceId },
              { $pull: { usersDisliked: user }, $inc: { dislikes: -1 } }
            )
              .then(() => res.status(200).json({ message: "Sauce neutre !" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
  }
};
