import dotenv from 'dotenv';
import { obtenerRabbitChannel } from '../events/listener/RabbitEventListener';
import { RespuestaCompra, Orden } from '../models/models';
import { OrdenRepository } from '../repositories/OrdenRepository';
import { gestionar } from './PreparacionOrdenService';
dotenv.config()
export async function reanudarOrdenPorCompra(): Promise<boolean> {

    const cola = process.env.QUEUE_RESPUESTA_COMPRA || '';

    const channel = await obtenerRabbitChannel(cola);



    channel.consume(
        cola,
        (msg) => {
            if (msg) {


                let respuesta: RespuestaCompra = JSON.parse(msg.content.toString());
                reanudarOrden(respuesta).then();


                channel.ack(msg);
            }
        },
        { noAck: false }
    );


    if (channel.connection) {
        return true;
    }
    return false;


}

async function reanudarOrden(respuesta: RespuestaCompra): Promise<boolean> {
    const ordenRepository = new OrdenRepository();

    const orden: Orden = await ordenRepository.getById(respuesta.ordenid);
    console.log(`Orden reanudada: ${orden}`);
    return gestionar(respuesta.clientid, orden);

}