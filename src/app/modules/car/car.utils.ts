import { Types } from "mongoose";
import { Booking } from "../booking/booking.model";
import { CAR_STATUS } from "../booking/booking.interface";

export const getCarTripCount = async (
    carId: Types.ObjectId | string
): Promise<number> => {
    const count = await Booking.countDocuments({
        carId: new Types.ObjectId(carId),
        carStatus: CAR_STATUS.COMPLETED,
        isCancelled: { $ne: true },
    });

    return count;
};

// bulk car trip
export const getCarTripCountMap = async (
    carIds: Types.ObjectId[]
): Promise<Record<string, number>> => {
    const result = await Booking.aggregate([
        {
            $match: {
                carId: { $in: carIds },
                carStatus: CAR_STATUS.COMPLETED,
                isCancelled: { $ne: true },
            },
        },
        {
            $group: {
                _id: "$carId",
                count: { $sum: 1 },
            },
        },
    ]);

    const map: Record<string, number> = {};
    for (const item of result) {
        map[item._id.toString()] = item.count;
    }

    return map;
};
