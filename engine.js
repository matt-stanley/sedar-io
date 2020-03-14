

  function set_color() {
    document.getElementById('board').style.backgroundColor = document.getElementById('color').value;
  }

  function restart() {
    start_game();
    var start = document.getElementById('start');
    start.innerHTML='Restart';
    start.classList.remove('btn-success');
    start.classList.add('btn-danger');
  }

    var canvas = document.getElementById("board");
    var ctx = canvas.getContext("2d");

    var board;
    var arrow;
    var player_pos;

    var current_player = 0;

    var mode;
    var comp_color;



    var loc = -1;
    function set_loc() {
      var rect = canvas.getBoundingClientRect()
      var USER_X = event.clientX - rect.left;
      var USER_Y = event.clientY - rect.top;
      var row = (USER_Y - (USER_Y % 100)) / 100;
      var col = (USER_X - (USER_X % 100)) / 100;
      loc = row * 8 + col;
      console.log("loc = ", loc);
    }

    function clean_board() {
      console.log("clean_board()");
      board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      arrow = []; // tail p, head p, slope, tail r, tail c, head r, head c
      player_pos = [];
      current_player = 0;
    }

    function arrowize(p1,p2) {
      console.log("arrowize()");
      var arrow_tail_r = Math.floor(p1/8);
      var arrow_tail_c = p1 % 8;
      var arrow_head_r = Math.floor(p2/8);
      var arrow_head_c = p2 % 8;
      var slope = Infinity;

      // make sure that the tail is to the left
      if (arrow_tail_c > arrow_head_c) {
        temp_tail_r = arrow_tail_r;
        temp_tail_c = arrow_tail_c;
        arrow_tail_r = arrow_head_r;
        arrow_tail_c = arrow_head_c;
        arrow_head_r = temp_tail_r;
        arrow_head_c = temp_tail_c;
      }

      if (arrow_tail_c == arrow_head_c) { // vertical
        arrow_tail_r = 0;
        arrow_head_r = 7;
      }
      else if (arrow_tail_r == arrow_head_r) { // horizontal
        slope = 0;
        arrow_tail_c = 0;
        arrow_head_c = 7;
      }
      else {
        slope = arrow_tail_r < arrow_head_r ? -1 : 1;

        // find edge for tail
        while (arrow_tail_c > 0 && arrow_tail_r > 0 && arrow_tail_r < 7) {
          arrow_tail_c--;
          arrow_tail_r += slope;
        }

        // find edge for head
        while (arrow_head_c < 7 && arrow_head_r > 0 && arrow_head_r < 7) {
          arrow_head_c++;
          arrow_head_r -= slope;
        }
      }
      arrow = [arrow_tail_r * 8 + arrow_tail_c, arrow_head_r * 8 + arrow_head_c, slope, arrow_tail_r, arrow_tail_c, arrow_head_r, arrow_head_c];
    }

    function is_on_arrow(p) {
      console.log("is_on_arrow()");
      if (arrow == []) {
        return false;
      }
      var x1 = arrow[4];
      var y1 = -1 * arrow[3];
      var x2 = arrow[6];
      var y2 = -1 * arrow[5];
      var r = -1 * Math.floor(p / 8);
      var c = p % 8;

      return (r - y1) * (x2 - x1) == (y2 - y1) * (c - x1);
    }

    function is_on_same_side_of_arrow(p1, p2) {
      if (arrow.length == 0) {
        return true;
      }

      // arrow is vertical
    	if (arrow[2] == Infinity) {
    		if (((p1 % 8) < arrow[4] && (p2 % 8) < arrow[4]) || ((p1 % 8) > arrow[4] && (p2 % 8) > arrow[4]))
    			return true;
    		else
    			return false;
    	}

    	// arrow is slanted
    	else {
    		var row_on_arrow_in_col_of_p1 = arrow[3] + arrow[2] * (arrow[4] - (p1 % 8));
    		var row_on_arrow_in_col_of_p2 = arrow[3] + arrow[2] * (arrow[4] - (p2 % 8));
    		if (Math.floor(p1 / 8) > row_on_arrow_in_col_of_p1 && Math.floor(p2 / 8) > row_on_arrow_in_col_of_p2)
    			return true;
    		if (Math.floor(p1 / 8) < row_on_arrow_in_col_of_p1 && Math.floor(p2 / 8) < row_on_arrow_in_col_of_p2)
    			return true;
    		return false;
    	}
    }

    function can_move_to(p) {
      // occupied
      if (board[p] != 0) {
        return false;
      }

      var r1 = Math.floor(player_pos[current_player] / 8);
      var c1 = player_pos[current_player] % 8;
      var r2 = Math.floor(p / 8);
      var c2 = p % 8;


      // blocked
      var start_r = r1;
      var start_c = c1;
      var r_dir = r1 == r2 ? 0 : (r2 - r1) / Math.abs(r2 - r1);
      var c_dir = c1 == c2 ? 0 : (c2 - c1) / Math.abs(c2 - c1);
      while (start_r != r2 || start_c != c2) {
        start_r += r_dir;
        start_c += c_dir;
        if (board[start_r * 8 + start_c] != 0) {
          return false;
        }
      }

      // queen's move
      if ((Math.abs(r1 - r2) != Math.abs(c1 - c2) || Math.abs(c1 - c2) == 0) && Math.abs(c1 - c2) != 0 && Math.abs(r1 - r2) != 0) {
        return false;
      }

      // same side as arrow
      if (!is_on_same_side_of_arrow(player_pos[current_player], p)) {
        return false;
      }

      // everything passes
      return true;
    }

    function get_possible_moves() {
      possible_moves = [];
      for (p in board) {
        if (can_move_to(p)) {
          possible_moves.push(p);
        }
      }
      return possible_moves;
    }

    function get_comp_move() {
      console.log("get_comp_move()");
      possible_moves = get_possible_moves();
      var out = -1;
      if (possible_moves.length == 0) {
        out = -1;
      }
      else if (diff == 0) {
        out = possible_moves[0];
      }
      else if (diff == 1) {
        out = possible_moves[Math.floor(Math.random() * possible_moves.length)];
      }
      else if (diff == 2) {
        out = look_forward_one_step(board, arrow, player_pos, current_player);
      }
      console.log("out = ", out);
      return out;
    }



    function update_board() {
      console.log("update_board()");
      ctx.clearRect(0, 0, 800, 800);

      // add the grid lines
      ctx.fillStyle = "lightgrey";
      for (var i = 1; i < 8; i++) {
        ctx.fillRect(0, i * 100, 800, 2);
        ctx.fillRect(i * 100, 0, 2, 800);
      }

      // add square markers
      for (p in board) {
        var mark = board[p];

        var size = {1:100, 2:80, 3:80}[mark];
        var color = {1:"lightgrey", 2:"white", 3:"black"}[mark];
        ctx.fillStyle = color;
        var x = 100 * (p % 8) + ((100 - size) / 2);
        var y = 100 * Math.floor(p / 8) + ((100 - size) / 2);

        // block piece
        if (mark == 1) {
          ctx.fillRect(x, y, size, size);
        }
        // queen piece
        if (mark > 1) {
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI, false);
          ctx.fill();
          if (p == player_pos[current_player] && player_pos.length == 2){
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, 10, 0, 2 * Math.PI, false);
            ctx.fill();
            // ctx.fillRect(x+30, y+30, 20, 20);
          }
        }
        // suggestions
        if (player_pos.length == 2) {
          if (can_move_to(p)) {
            var x = 100 * (p % 8) + 40;
            var y = 100 * Math.floor(p / 8) + 40;
            ctx.fillStyle = "lightgreen";
            ctx.fillRect(x, y, 20, 20);
          }
        }
      }


      // draw arrow // TODO: make this less messy
      if (arrow != []) {

        var arrow_tail_r = Math.floor(arrow[0]/8);
        var arrow_tail_c = arrow[0] % 8;
        var arrow_head_r = Math.floor(arrow[1]/8);
        var arrow_head_c = arrow[1] % 8;

        var arrow_tail_x = 0;
        var arrow_tail_y = 0;
        var arrow_head_x = 800;
        var arrow_head_y = 800;

        if (arrow_tail_c == arrow_head_c) { // vertical
          arrow_tail_x = 50 + arrow_tail_c * 100;
          arrow_head_x = 50 + arrow_tail_c * 100;
        }
        else if (arrow_tail_r == arrow_head_r) { // horizontal
          arrow_tail_y = 50 + arrow_tail_r * 100;
          arrow_head_y = 50 + arrow_tail_r * 100;
        }
        else {
          var slope = arrow_tail_r < arrow_head_r ? -1 : 1;
          arrow_tail_x = arrow_tail_c * 100;
          arrow_tail_y = arrow_tail_r * 100 + 50 + (slope * 50);
          arrow_head_x = arrow_head_c * 100 + 100;
          arrow_head_y = arrow_head_r * 100 + 50 - (slope * 50);
        }

        ctx.beginPath();
        ctx.moveTo(arrow_tail_x, arrow_tail_y);
        ctx.lineTo(arrow_head_x, arrow_head_y);
        ctx.stroke();
      }
    }



    function game_is_over() {
      console.log("game_is_over()");
      for (p in board) {
        if (can_move_to(p))
          return false;
      }
      return true;
    }


    function start_game() {
      console.log("start_game()");
      clean_board();
      update_board();
      mode = document.querySelector('input[name="mode"]:checked').value;
      comp_color = document.querySelector('input[name="comp_color"]:checked').value;
      diff = document.querySelector('input[name="diff"]:checked').value;
      document.getElementById("console").innerHTML = ">>> select white position";
    }

    function move_to(p) {
      console.log("move_to()");
      // add block piece
      board[player_pos[current_player]] = 1;

      // update arrow
      arrowize(player_pos[current_player], p);

      // move current player
      board[p] = current_player + 2;
      player_pos[current_player] = p;

      // switch player
      current_player = 1 - current_player;

      if (is_on_arrow(player_pos[0]) && is_on_arrow(player_pos[1])) {
        arrow = [];
      }
    }



    function comp_move() {
      var move = get_comp_move();
      move_to(move);
      document.getElementById("console").innerHTML = ">>> " + {0:"white", 1:"black"}[current_player] + " move";
      if (game_is_over()) {
        document.getElementById("console").innerHTML =  ">>> " + {0:"White", 1:"Black"}[1 - current_player] + " wins!";
      }
    }


    function game_step() {
      console.log("game_step()");
      // no pieces are on the board, so place white
      if (player_pos.length == 0) {
        board[loc] = 2;
        player_pos.push(loc);
        document.getElementById("console").innerHTML = ">>> select black position";
      }
      // only white is on the board, so place black
      else if (player_pos.length == 1 && loc != player_pos[0]) {
        board[loc] = 3;
        player_pos.push(loc);
        document.getElementById("console").innerHTML = ">>> white move";
        if ((mode == "computer") && (comp_color == "white")){
          comp_move();
        }
      }
      // both pieces are placed
      else if (player_pos.length == 2) {
        if (can_move_to(loc)) {
          move_to(loc);
          document.getElementById("console").innerHTML = ">>> " + {0:"white", 1:"black"}[current_player] + " move";
          if (game_is_over()) {
            document.getElementById("console").innerHTML =  ">>> " + {0:"White", 1:"Black"}[1 - current_player] + " wins!";
          }
          else if (mode == "computer") {
            comp_move();
          }
        }
      }
      update_board();
    }