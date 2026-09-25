<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// We will use a generic controller approach for these simple CRUD entities to save massive duplication of code
class GenericResourceController extends Controller
{
    protected $table;
    protected $validations = [];

    public function __construct(Request $request)
    {
        // Detect table based on route prefix, e.g. api/subjects -> subjects
        $segments = $request->segments();
        if (count($segments) >= 2 && $segments[0] === 'api') {
            $this->table = $segments[1];
            // Normalize for model/table differences
            if ($this->table === 'classes') $this->table = 'school_classes';
        }
    }

    public function index()
    {
        if (!$this->table) return response()->json([]);
        return response()->json(DB::table($this->table)->get());
    }

    public function store(Request $request)
    {
        if (!$this->table) return response()->json(['error' => 'No table'], 400);
        
        $data = $request->all();
        $data['created_at'] = now();
        $data['updated_at'] = now();
        
        $id = DB::table($this->table)->insertGetId($data);
        return response()->json(DB::table($this->table)->find($id), 201);
    }

    public function show($id)
    {
        if (!$this->table) return response()->json(['error' => 'No table'], 400);
        return response()->json(DB::table($this->table)->find($id));
    }

    public function update(Request $request, $id)
    {
        if (!$this->table) return response()->json(['error' => 'No table'], 400);
        
        $data = $request->all();
        $data['updated_at'] = now();
        
        DB::table($this->table)->where('id', $id)->update($data);
        return response()->json(DB::table($this->table)->find($id));
    }

    public function destroy($id)
    {
        if (!$this->table) return response()->json(['error' => 'No table'], 400);
        
        DB::table($this->table)->where('id', $id)->delete();
        return response()->json(null, 204);
    }
}
