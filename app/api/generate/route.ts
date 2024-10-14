import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";

export async function POST(request:NextRequest){

    const body = await request.json();
    console.log(body);

    const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

    if(!body.prompt) return NextResponse.json({error: "Prompt is required"});

    if(!together.apiKey) return NextResponse.json({error: "API key is required"});

    const response = await together.images.create({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: body.prompt,
        width: 1024,
        height: 768,
        steps: 3,
        seed: 123,
        n: 1
});


    return NextResponse.json(response.data[0]);
}
