const db = require('../config/db');
require('dotenv').config();

// 모든 상품 조회
exports.getAllCartItems = async (req, res) => {
  const { user_id } = req.params;
  const numericUserId = Number(user_id);
  try {
    const [cartItems] = await db.query(
      `
      SELECT 
        cart.id AS cart_id,
        cart.product_id,
        cart.user_id,
        cart.quantity,
        cart.checked,
        product.image,
        product.name,
        product.price
      FROM cart
      JOIN product ON cart.product_id = product.id
      WHERE cart.user_id = ?
      `,
      [numericUserId]
    );

    res.status(200).json({ message: '장바구니 조회 성공', data: cartItems });
  } catch (error) {
    console.error('장바구니 조회 오류:', error);
    res.status(500).json({ message: '장바구니 조회 실패' });
  }
};

// 장바구니 상품 추가
exports.postAllCartItems = async (req, res) => {
  const { product_id, user_id, quantity, checked } = req.body;

  try {
    const [existingItem] = await db.query('SELECT quantity FROM cart WHERE product_id = ? AND user_id = ?', [product_id, user_id]);

    if (existingItem.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ?, checked = ? WHERE product_id = ? AND user_id = ?', [quantity, checked, product_id, user_id]);

      res.status(200).json({ message: '상품 수량이 업데이트되었습니다' });
    } else {
      await db.query('INSERT INTO cart (product_id, user_id, quantity, checked) VALUES (?, ?, ?, ?)', [product_id, user_id, quantity, checked]);

      res.status(201).json({ message: '상품이 장바구니에 추가되었습니다' });
    }
  } catch (error) {
    console.error('장바구니 상품 추가 오류:', error);
    res.status(500).json({ message: '장바구니 상품 추가 실패' });
  }
};
