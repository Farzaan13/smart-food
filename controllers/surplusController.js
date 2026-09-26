const SurplusFood = require("../models/SurplusFood");

const getSurplusPage = async (req, res) => {
    try {

        const surplusFoods = await SurplusFood
            .find({
                kitchen: req.user._id
            })
            .sort({
                createdAt: -1
            });

        res.render("kitchen/surplus", {
            title: "Surplus Food",
            user: req.user,
            surplusFoods
        });

    } catch (error) {

        console.error(
            "Surplus page error:",
            error.message
        );

        res.status(500).send(
            "Unable to load surplus food."
        );
    }
};


const createSurplusFood = async (req, res) => {

    try {

        const {
            foodName,
            category,
            quantity,
            unit,
            preparedAt,
            pickupDeadline,
            description,
            pickupAddress,
            city
        } = req.body;


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            !foodName ||
            !quantity ||
            !preparedAt ||
            !pickupDeadline ||
            !pickupAddress ||
            !city
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );
        }


        // =========================
        // DATE VALIDATION
        // =========================

        const preparedDate = new Date(preparedAt);
        const deadlineDate = new Date(pickupDeadline);


        if (isNaN(preparedDate.getTime())) {

            return res.status(400).send(
                "Invalid Prepared At date."
            );
        }


        if (isNaN(deadlineDate.getTime())) {

            return res.status(400).send(
                "Invalid Pickup Deadline."
            );
        }


        if (deadlineDate <= preparedDate) {

            return res.status(400).send(
                "Pickup Deadline must be later than Prepared At."
            );
        }


        // =========================
        // QUANTITY VALIDATION
        // =========================

        const numericQuantity = Number(quantity);

        if (
            isNaN(numericQuantity) ||
            numericQuantity <= 0
        ) {

            return res.status(400).send(
                "Quantity must be greater than 0."
            );
        }


        // =========================
        // CREATE SURPLUS
        // =========================

        await SurplusFood.create({

            kitchen: req.user._id,

            foodName: foodName.trim(),

            category,

            quantity: numericQuantity,

            unit,

            preparedAt: preparedDate,

            pickupDeadline: deadlineDate,

            description: description
                ? description.trim()
                : "",

            pickupAddress: pickupAddress.trim(),

            city: city.trim(),

            status: "available"

        });


        // =========================
        // SUCCESS
        // =========================

        res.redirect(
            "/dashboard/kitchen/surplus"
        );


    } catch (error) {

        console.error(
            "Create surplus error:",
            error.message
        );

        res.status(500).send(
            "Unable to create surplus food listing."
        );
    }
};


const cancelSurplusFood = async (req, res) => {

    try {

        const surplus = await SurplusFood.findOne({

            _id: req.params.id,

            kitchen: req.user._id

        });


        if (!surplus) {

            return res.status(404).send(
                "Surplus food not found."
            );
        }


        if (surplus.status !== "available") {

            return res.status(400).send(
                "This listing cannot be cancelled."
            );
        }


        surplus.status = "cancelled";

        await surplus.save();


        res.redirect(
            "/dashboard/kitchen/surplus"
        );


    } catch (error) {

        console.error(
            "Cancel surplus error:",
            error.message
        );

        res.status(500).send(
            "Unable to cancel listing."
        );
    }
};


module.exports = {
    getSurplusPage,
    createSurplusFood,
    cancelSurplusFood
};