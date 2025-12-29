"use server";

import ServiceCatagory from "../database/models/package.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createServive() {
  try {
    await connectToDatabase();

    const newService = await ServiceCatagory.create({
        title: 'buissness',
        subCatagory: [
            {
                title: 'finance',
                oneline: 'finance',
                description: 'finance',
                packages: [
                    {
                        name: 'finance package 1',
                        originalPrice: 1000,
                        offerPrice: 800,
                        description: 'finance package 1',
                        features: ['feature 1', 'feature 2']
                    },
                    {
                        name: 'finance package 2',
                        originalPrice: 1500,
                        offerPrice: 1200,
                        description: 'finance package 2',
                        features: ['feature 3', 'feature 4'],
                        
                    }
                ]
            }
        ]
    });

    return JSON.parse(JSON.stringify(newService));
  } catch (error) {
    handleError(error);
  }
}
