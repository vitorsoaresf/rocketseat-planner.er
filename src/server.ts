import fastify from "fastify";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import cors from "@fastify/cors";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);

app
  .listen({ port: 3333 })
  .then(() => {
    console.log("Run server success!");
  })
  .catch(() => {
    console.log("Run server error!");
  });
