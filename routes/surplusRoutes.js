const express = require("express");

const router = express.Router();

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getSurplusPage,
    createSurplusFood,
    cancelSurplusFood
} = require("../controllers/surplusController");


router.get(
    "/",
    requireAuth,
    requireRole("kitchen"),
    getSurplusPage
);


router.post(
    "/",
    requireAuth,
    requireRole("kitchen"),
    createSurplusFood
);


router.post(
    "/:id/cancel",
    requireAuth,
    requireRole("kitchen"),
    cancelSurplusFood
);


module.exports = router;