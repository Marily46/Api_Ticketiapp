const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost/ticketcenter', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String
});

const User = mongoose.model('User', userSchema);

const ticketSchema = new mongoose.Schema({
    text: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
});

const Ticket = mongoose.model('Ticket', ticketSchema);

app.post('/api/users/register', async (req, res) => {
    let user = new User({
        fullName: req.body.fullName,
        email: req.body.email
    });
    user = await user.save();
    res.send(user);
});

app.post('/api/tickets', async (req, res) => {
    let ticket = new Ticket({
        text: req.body.text,
        user: req.body.userId,
        status: 'pending'
    });
    ticket = await ticket.save();
    res.send(ticket);
});

app.get('/api/tickets/pending', async (req, res) => {
    const tickets = await Ticket.find({ status: 'pending' }).populate('user', 'fullName email');
    res.send(tickets);
});

app.put('/api/tickets/:id/complete', async (req, res) => {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    if (!ticket) return res.status(404).send('The ticket with the given ID was not found.');
    res.send(ticket);
});

app.get('/api/tickets/completed', async (req, res) => {
    const tickets = await Ticket.find({ status: 'completed' }).populate('user', 'fullName email');
    res.send(tickets);
});

const port = process.env.PORT || 4001;
app.listen(port, () => console.log(`Listening on port ${port}`));