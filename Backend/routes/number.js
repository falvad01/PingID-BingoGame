const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Number endpoint');
});

module.exports = router;
