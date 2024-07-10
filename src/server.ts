import fastify from "fastify";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { confirmParticipant } from "./routes/confirm-participants";
import { createLink } from "./routes/create-link";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import cors from "@fastify/cors";
import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { getLinks } from "./routes/get-links";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);

app
  .listen({ port: 3333 })
  .then(() => {
    console.log("Run server success!");
  })
  .catch(() => {
    console.log("Run server error!");
  });
