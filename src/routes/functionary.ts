import express, { Request, Response } from "express";
import { TypedRequestBody } from "../types/interfaces";
import {
  createNewFunctionary,
  selectedFunc,
  updateHoursWorked,
} from "../ORM/prismaCalls";
import { Role } from "@prisma/client";
const router = express.Router();

router.get("/func/:id", async (req: Request, res: Response) => {
  res.status(200).json(await selectedFunc(req.params.id));
});

// Need to be more generic
router.put(
  "/func/:id",
  async (
    req: TypedRequestBody<{
      hoursWorked: number;
    }>,
    res: Response
  ) => {
    res
      .status(200)
      .json(await updateHoursWorked(req.params.id, req.body.hoursWorked));
  }
);

router.post(
  "/func",
  async (
    req: TypedRequestBody<{
      name: string;
      amountPerHour: number;
      hoursWorked: number;
      role?: Role;
      rhManagerId?: number;
      teamId?: number;
    }>,
    res: Response
  ) => {
    res.status(201).json(await createNewFunctionary(req.body));
  }
);

export default router;
