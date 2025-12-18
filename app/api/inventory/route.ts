import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos de la API');
        }

        const data = await response.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error en API proxy:', error);
        return NextResponse.json(
            { error: 'Error al cargar el inventario' },
            { status: 500 }
        );
    }
}
