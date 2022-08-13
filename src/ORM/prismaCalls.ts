import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

export const selectedFunc = (urlParam: string) =>
  prisma.functionary.findUnique({
    where: { id: parseInt(urlParam) },
  });

export const updateHoursWorked = (urlParam: string, hoursWorked: number) =>
  prisma.functionary.update({
    where: {
      id: parseInt(urlParam),
    },
    data: {
      hoursWorked: {
        increment: hoursWorked,
      },
    },
  });

export const createNewFunctionary = (functionary: {
  name: string;
  amountPerHour: number;
  hoursWorked: number;
  role?: Role;
  rhManagerId?: number;
  teamId?: number;
}) => prisma.functionary.create({ data: functionary });
