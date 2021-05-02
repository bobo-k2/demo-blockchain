const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () => {
  let wallet, tp, bc;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a transaction', () => {
    let transaction, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'r4nd0m';
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe('and doing the samoe transaction', () => {
      beforeEach(() => {
        transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
      });

      it('doubles the send sendAmount from the wallet balance', () => {
        expect(transaction.outputs.find(o => o.address === wallet.publicKey).amount)
          .toEqual(wallet.balance - sendAmount * 2);
      })

      it('cones the sendAmount output for the recipient', () => {
        expect(
          transaction.outputs.filter(o => o.address === recipient)
          .map(o => o.amount)).toEqual([sendAmount, sendAmount]);
      });
    })
  });

  describe('calculating a nalance', () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(() => {
      senderWallet = new Wallet();
      addBalance = 100;
      repeatAdd = 3;

      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }

      bc.addBlock(tp.transactions);
    });

    it('calculate the balance for blockchain transactions matching the recipient', () => {
      expect(wallet.calculateBalance(bc))
        .toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
    });

    it('calculate the balance for blockchain transactions matching the sender', () => {
      expect(senderWallet.calculateBalance(bc))
        .toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
    });

    describe('and the recipient condicts a transaction', () => {
      let subtractBalance, recipientBalance;

      beforeEach(() => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
        bc.addBlock(tp.transactions);
      });

      describe('and sender sends another transacrion to the recipient', () => {
        beforeEach(() => {
          tp.clear();
          senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
          bc.addBlock(tp.transactions);
        });

        it('calculates recipient balance only using tran since it most recent one', () => {
          expect(wallet.calculateBalance(bc))
            .toEqual(recipientBalance - subtractBalance);
        });
      });
    });
  });
})