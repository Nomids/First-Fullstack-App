const {Router} = require('express');
const Order = require('../modules/order')
const router = Router();
const mitAuth = require('../middleware/routeAuth')


router.post('/order', async (req, res) => {
    const user = await req.user
        .populate('cart.items.course').execPopulate();

    const courses = user.cart.items.map(i => {
        return ({
            count: i.count,
            course: {...i.course._doc}
        })
    });

    const order = new Order({
        user: {
            name: req.user.name,
            userId: req.user
        },
        courses
    });

    await order.save();

    await req.user.clearCart();

    res.redirect('/order')
})

router.get('/order', mitAuth, async (req, res) => {
    try{
        const orders = await Order.find({'user.userId': req.user._id}).populate('user.userId');

        res.render('order', {
            isOrder: true,
            title: "Order",
            orders: orders.map(o => {
                return {
                    ...o._doc,
                    price: o.courses.reduce((total, c) => {
                        return total += c.count * c.course.price
                    }, 0)
                }
            })
        })
    } catch(e){
        console.log(e);
    }
})

module.exports = router