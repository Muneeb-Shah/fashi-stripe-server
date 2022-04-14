const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51KnZokGDP9hBttjZom5zhSyygxF7VgW3rYNsFGdpwfLz5DngCLtnXXfBeEVyRfgo5jywKuFDoskXwcVUyMIxiVlr00NwrpNz6K"
);
const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome into react shop website");
});

app.post("/checkout", async (req, res) => {
  let status;
  try {
    const { product, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
      description: "Test Customer",
    });

    const key = uuidv4();

    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased ${product.name}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      { idempotencyKey: key }
    );

    status = "success";
    console.log(status);
  } catch (error) {
    console.log(error);
    status = "faliure";
    console.log(status);
  }
  res.json({ status });
});

app.listen(8080, () => {
  console.log("app is running on port 8080");
});
