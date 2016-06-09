
// Configuration

QUnit.config.reorder = false;

// Extra Assertions

function isInstance(model, Class, message)
{
  ok( model instanceof Class, message );
}

function isType(value, type, message)
{
  strictEqual( typeof value, type, message );
}

function pushChanges(target, changes)
{
  var previous = {};

  for (var prop in changes)
  {
    previous[ prop ] = target[ prop ];
    target[ prop ] = changes[ prop ];
  }

  return function()
  {
    Rekord.transfer( previous, target );
  };
};

// Extending Assert

QUnit.assert.timer = function()
{
  return QUnit.assert.currentTimer = new TestTimer();
};

function TestTimer()
{
  this.callbacks = [];
  this.time = 0;
}

TestTimer.prototype =
{
  wait: function(millis, func)
  {
    var callbacks = this.callbacks;
    var at = millis + this.time;

    if ( callbacks[ at ] )
    {
      callbacks[ at ].push( func );
    }
    else
    {
      callbacks[ at ] = [ func ];
    }
  },
  run: function()
  {
    var callbacks = this.callbacks;

    for (var i = 0; i < callbacks.length; i++)
    {
      var calls = callbacks[ i ];

      this.time = i;

      if ( calls )
      {
        for (var k = 0; k < calls.length; k++)
        {
          calls[ k ]();
        }
      }
    }
  }
};

function wait(millis, func)
{
  QUnit.assert.currentTimer.wait( millis, func );
}
