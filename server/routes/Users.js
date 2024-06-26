const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcryptjs");
const { validateToken } = require("../middleware/AuthMiddleware");
const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    });
    res.json("Success !!");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });

  if (!user) res.json({ error: "User Doesn't Exist" });

  bcrypt.compare(password, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong Username and Password !" });

    const accessToken = sign(
      { username: user.username, id: user.id },
      "importantsecret"
    );

    res.json({ token: accessToken, username: username, id: user.id });
  });
});

router.get("/auth", validateToken, async (req, res) => {
  res.json(req.user);
});

router.get("/info/:id", async (req, res) => {
  const id = req.params.id;
  const basicinfo = await Users.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  res.json(basicinfo);
});

router.put('/changepassword',validateToken,async (req,res)=>{
  const {oldPassword,newPassword}=req.body;
  const user = await Users.findOne({ where: { username: req.user.username } });

  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong Password !" });

    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        {password:hash},
        {where:{username:req.user.username}}
      );
      res.json("Success !!");
    });
  });

})

module.exports = router;
